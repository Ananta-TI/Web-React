import React from "react";
import { motion } from "framer-motion";
import { 
  Loader2, Hash, Clock, FileText, Fingerprint, Cpu, Layers, 
  Globe, Link as LinkIcon, Server, ListTree, Code, ArrowRight, ShieldAlert,
  BookOpen, MapPin, Building, Network, Activity, Vote
} from "lucide-react";
import SectionCard from "../Shared/SectionCard";
import CopyableText from "../Shared/CopyableText";

const DetailsTab = ({ metadata, isDarkMode }) => {
  // 1. Loading State
  if (!metadata) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500"/>
        <p>Fetching deep intelligence...</p>
      </div>
    );
  }

  // 2. Data Extraction & Type Detection
  const attributes = metadata?.attributes || {};
  const type = metadata?.type || attributes.type_description || "unknown";

  // Deteksi Tipe Spesifik
  const isUrl = type === 'url' || !!attributes.url;
  const isFile = type === 'file' || !!attributes.md5; // File pasti punya hash
  const isDomain = type === 'domain';
  const isIp = type === 'ip_address';

  // --- Helper Functions ---
  const formatSize = (size) => size ? `${(size / 1024).toFixed(2)} KB` : "-";
  
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try { return new Date(timestamp * 1000).toUTCString(); } catch (e) { return "-"; }
  };

  const getHttpCodeColor = (code) => {
    if (code >= 200 && code < 300) return "text-green-500";
    if (code >= 300 && code < 400) return "text-blue-500";
    if (code >= 400 && code < 500) return "text-yellow-500";
    if (code >= 500) return "text-red-500";
    return "text-gray-500";
  };

  // Helper IP untuk URL/Domain
  const getServingIP = () => {
    if (attributes.last_http_response_ip_address) return attributes.last_http_response_ip_address;
    if (attributes.last_dns_records && Array.isArray(attributes.last_dns_records)) {
      const aRecord = attributes.last_dns_records.find(r => r.type === 'A');
      if (aRecord) return `${aRecord.value} (via DNS)`;
    }
    return "-";
  };

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* =======================
            SECTION 1: BASIC PROPERTIES (ADAPTIVE)
           ======================= */}
        <div className="lg:col-span-2">
          <SectionCard 
            title={isUrl ? "URL Properties" : isFile ? "File Properties" : isDomain ? "Domain Info" : "IP Address Info"} 
            icon={isUrl ? Globe : isFile ? Hash : isIp ? Server : Network} 
            isDarkMode={isDarkMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* --- URL VIEW --- */}
              {isUrl && (
                <>
                  <div className="md:col-span-2"><CopyableText label="Target URL" text={attributes.url || "-"} /></div>
                  <div className="md:col-span-2"><CopyableText label="Final URL" text={attributes.last_final_url || attributes.url || "-"} /></div>
                  <CopyableText label="Page Title" text={attributes.title || "-"} />
                  <div className="flex flex-col space-y-1">
                     <span className="text-xs font-bold uppercase opacity-50">HTTP Status</span>
                     <span className={`font-mono text-sm ${getHttpCodeColor(attributes.last_http_response_code)}`}>
                       {attributes.last_http_response_code || "-"}
                     </span>
                  </div>
                  <CopyableText label="Content Length" text={formatSize(attributes.last_http_response_content_length)} />
                  <CopyableText label="Content SHA-256" text={attributes.last_http_response_content_sha256 || "-"} isCode />
                  <CopyableText label="Serving IP" text={getServingIP()} />
                </>
              )}

              {/* --- FILE VIEW --- */}
              {isFile && (
                <>
                  <CopyableText label="MD5" text={attributes.md5 || "-"} isCode />
                  <CopyableText label="SHA-1" text={attributes.sha1 || "-"} isCode />
                  <CopyableText label="SHA-256" text={attributes.sha256 || "-"} isCode />
                  <CopyableText label="Vhash" text={attributes.vhash || "-"} isCode />
                  <CopyableText label="File Type" text={attributes.type_description || "-"} />
                  <CopyableText label="File Size" text={formatSize(attributes.size)} />
                  <CopyableText label="Magic Header" text={attributes.magic || "-"} />
                  <CopyableText label="SSDEEP" text={attributes.ssdeep || "-"} isCode />
                </>
              )}

              {/* --- DOMAIN VIEW --- */}
              {isDomain && (
                <>
                   <div className="md:col-span-2"><CopyableText label="Domain Name" text={metadata.id} /></div>
                   <CopyableText label="Registrar" text={attributes.registrar || "-"} icon={Building} />
                   <CopyableText label="Creation Date" text={formatDate(attributes.creation_date)} />
                   <CopyableText label="Last Update" text={formatDate(attributes.last_update_date)} />
                   <CopyableText label="Expiration" text={formatDate(attributes.expiration_date)} />
                   <div className="flex flex-col space-y-1">
                      <span className="text-xs font-bold uppercase opacity-50">Reputation</span>
                      <span className={`font-bold ${attributes.reputation < 0 ? "text-red-500" : "text-green-500"}`}>{attributes.reputation || 0} Points</span>
                   </div>
                </>
              )}

              {/* --- IP ADDRESS VIEW --- */}
              {isIp && (
                <>
                   <div className="md:col-span-2"><CopyableText label="IP Address" text={metadata.id} /></div>
                   <CopyableText label="ASN" text={attributes.asn || "-"} icon={Network} />
                   <CopyableText label="Network Owner" text={attributes.as_owner || "-"} />
                   <CopyableText label="Country" text={attributes.country || "-"} icon={MapPin} />
                   <CopyableText label="Continent" text={attributes.continent || "-"} />
                   <div className="flex flex-col space-y-1">
                      <span className="text-xs font-bold uppercase opacity-50">Reputation</span>
                      <span className={`font-bold ${attributes.reputation < 0 ? "text-red-500" : "text-green-500"}`}>{attributes.reputation || 0} Points</span>
                   </div>
                </>
              )}
            </div>
          </SectionCard>
        </div>

        {/* =======================
            SECTION 2: INTELLIGENCE & CONTEXT
           ======================= */}

        {/* WHOIS DATA (Available for Domain, URL, IP) */}
        {(attributes.whois || attributes.whois_date) && (
          <div className="lg:col-span-2">
            <SectionCard title="WHOIS Intelligence" icon={BookOpen} isDarkMode={isDarkMode}>
              {attributes.whois ? (
                <div className={`p-3 rounded-lg text-xs font-mono max-h-600 overflow-y-auto whitespace-pre-wrap border ${isDarkMode ? "bg-zinc-900/50 border-zinc-700 text-zinc-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                  {attributes.whois}
                </div>
              ) : (
                 <div className="text-sm opacity-70">Last WHOIS lookup: {formatDate(attributes.whois_date)}</div>
              )}
            </SectionCard>
          </div>
        )}

        {/* DNS RECORDS (Khusus Domain) */}
        {isDomain && attributes.last_dns_records && (
           <div className="lg:col-span-2">
             <SectionCard title="DNS Records" icon={ListTree} isDarkMode={isDarkMode}>
               <div className={`overflow-x-auto rounded-lg border ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                 <table className="w-full text-xs text-left">
                   <thead className={isDarkMode ? "bg-zinc-700" : "bg-gray-100"}>
                     <tr><th className="p-2">Type</th><th className="p-2">Value</th><th className="p-2">TTL</th></tr>
                   </thead>
                   <tbody>
                     {attributes.last_dns_records.map((rec, i) => (
                       <tr key={i} className={`border-b last:border-0 ${isDarkMode ? "border-zinc-700/50" : "border-gray-100"}`}>
                         <td className="p-2 font-bold text-blue-500 w-16">{rec.type}</td>
                         <td className="p-2 font-mono break-all">{rec.value}</td>
                         <td className="p-2 w-16 opacity-50">{rec.ttl}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </SectionCard>
           </div>
        )}

        {/* =======================
            SECTION 3: FILE SPECIFIC DETAILS
           ======================= */}
        {isFile && (
          <>
            {/* Signature Info */}
            {attributes.signature_info && (
              <div className="lg:col-span-2">
                <SectionCard title="Signature Info" icon={Fingerprint} isDarkMode={isDarkMode}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CopyableText label="Product" text={attributes.signature_info.product || "-"} />
                    <CopyableText label="Description" text={attributes.signature_info.description || "-"} />
                    <CopyableText label="Original Name" text={attributes.signature_info.original_name || "-"} />
                    <CopyableText label="Copyright" text={attributes.signature_info.copyright || "-"} />
                    <CopyableText 
                      label="Signers" 
                      text={attributes.signature_info.signers_details?.map(s => s.name).join("; ") || "-"} 
                    />
                    <div className={`p-2 rounded border text-center text-xs font-bold uppercase ${
                      attributes.signature_info.verified 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {attributes.signature_info.verified ? "Signature Verified" : "Invalid Signature"}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* PE Info */}
            {attributes.pe_info && (
              <div className="lg:col-span-2">
                <SectionCard title="Portable Executable Info" icon={Cpu} isDarkMode={isDarkMode}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <CopyableText label="Target Machine" text={attributes.pe_info.machine_type || "-"} />
                    <CopyableText label="Entry Point" text={attributes.pe_info.entry_point || "-"} isCode />
                    <CopyableText label="Sections Count" text={attributes.pe_info.sections?.length || "0"} />
                  </div>
                  
                  {attributes.pe_info.sections && attributes.pe_info.sections.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold uppercase opacity-50 mb-2 mt-4 flex items-center gap-1">
                        <Layers className="w-3 h-3"/> Sections
                      </h4>
                      <div className={`overflow-x-auto rounded-lg border ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                        <table className="w-full text-xs text-left">
                          <thead className={isDarkMode ? "bg-zinc-700" : "bg-gray-100"}>
                            <tr>
                              <th className="p-2">Name</th>
                              <th className="p-2">Virtual Size</th>
                              <th className="p-2">Entropy</th>
                              <th className="p-2">MD5</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attributes.pe_info.sections.map((s, i) => (
                              <tr key={i} className={`border-b last:border-0 ${isDarkMode ? "border-zinc-700/50" : "border-gray-100"}`}>
                                <td className="p-2 font-mono text-blue-500 whitespace-nowrap">{s.name}</td>
                                <td className="p-2">{s.virtual_size}</td>
                                <td className="p-2">{(s.entropy ?? 0).toFixed(2)}</td>
                                <td className="p-2 font-mono opacity-50 max-w-[100px] truncate" title={s.md5}>{s.md5}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </SectionCard>
              </div>
            )}

             {/* Names */}
             <SectionCard title="Known Names" icon={FileText} isDarkMode={isDarkMode}>
              <div className={`text-xs p-3 rounded-lg max-h-40 overflow-y-auto ${isDarkMode ? "bg-zinc-900/50 text-zinc-400" : "bg-gray-50 text-gray-600"}`}>
                {attributes.names && attributes.names.length > 0 ? (
                  attributes.names.map((n, i) => (
                    <div key={i} className="mb-1 pb-1 border-b border-dashed border-current/10 last:border-0 last:mb-0 break-all">
                      {n}
                    </div>
                  ))
                ) : (
                  <span className="italic opacity-70">No alternative names found</span>
                )}
              </div>
            </SectionCard>
          </>
        )}

        {/* =======================
            SECTION 4: URL SPECIFIC DETAILS
           ======================= */}
        {isUrl && (
          <>
            <SectionCard title="Web Content Info" icon={Code} isDarkMode={isDarkMode}>
              <div className="space-y-4">
                {attributes.categories && Object.keys(attributes.categories).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase opacity-50 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(attributes.categories).map((cat, i) => (
                        <span key={i} className={`px-2 py-1 rounded text-xs font-medium border ${isDarkMode ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {attributes.html_meta && (
                   <div className="grid grid-cols-1 gap-3">
                      <CopyableText label="Description" text={attributes.html_meta.description || "-"} />
                      <CopyableText label="Keywords" text={attributes.html_meta.keywords ? attributes.html_meta.keywords.join(", ") : "-"} />
                   </div>
                )}
                {attributes.threat_names && attributes.threat_names.length > 0 && (
                   <div>
                      <h4 className="text-xs font-bold uppercase opacity-50 mb-2 flex items-center gap-1 text-red-500"><ShieldAlert className="w-3 h-3"/> Threat Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {attributes.threat_names.map((threat, i) => (
                          <span key={i} className="px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                            {threat}
                          </span>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            </SectionCard>
            {/* History Tab - Now visible for ALL types */}
        <SectionCard title="Analysis History" icon={Clock} isDarkMode={isDarkMode}>
          <div className="space-y-1">
            <CopyableText label="Creation Date" text={formatDate(attributes.creation_date)} />
            <CopyableText label="First Submission" text={formatDate(attributes.first_submission_date)} />
            <CopyableText label="Last Analysis" text={formatDate(attributes.last_analysis_date)} />
            {isUrl && <CopyableText label="Last Modification" text={formatDate(attributes.last_modification_date)} />}
          </div>
        </SectionCard>

            {(attributes.redirection_chain || attributes.last_http_response_headers) && (
              <div className="lg:col-span-2">
                 <SectionCard title="Network & Response" icon={ListTree} isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {attributes.redirection_chain && (
                        <div>
                          <h4 className="text-xs font-bold uppercase opacity-50 mb-3 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Redirection Chain</h4>
                          <div className={`rounded-lg border overflow-hidden ${isDarkMode ? "border-zinc-700 bg-zinc-900/30" : "border-gray-200 bg-gray-50"}`}>
                            {attributes.redirection_chain.map((url, i) => (
                              <div key={i} className={`p-3 text-xs flex items-center gap-2 border-b last:border-0 ${isDarkMode ? "border-zinc-700/50" : "border-gray-200"}`}>
                                <span className="opacity-50 font-mono">{(i+1).toString().padStart(2, '0')}</span>
                                <ArrowRight className="w-3 h-3 opacity-30" />
                                <span className="truncate font-medium text-blue-500" title={url}>{url}</span>
                              </div>
                            ))}
                            
                          </div>
                          
                        </div>
                        
                      )}
                      {attributes.last_http_response_headers && (
                        <div>
                           <h4 className="text-xs font-bold uppercase opacity-50 mb-3 flex items-center gap-1"><Server className="w-3 h-3"/> Response Headers</h4>
                           <div className={`p-3 rounded-lg text-xs font-mono max-h-600 overflow-y-auto border ${isDarkMode ? "bg-zinc-900/50 border-zinc-700 text-zinc-400" : "bg-white border-gray-200 text-gray-600"}`}>
                              {Object.entries(attributes.last_http_response_headers).map(([key, val], i) => (
                                <div key={i} className="mb-1 grid grid-cols-3 gap-2 border-b border-dashed border-current/10 pb-1 last:border-0 last:mb-0">
                                   <span className="font-bold col-span-1 truncate" title={key}>{key}</span>
                                   <span className="opacity-80 col-span-2 truncate" title={val}>{val}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                    
                 </SectionCard>
                 
              </div>
              
            )}
            
          </>
        )}

        {/* =======================
            SECTION 5: SHARED FOOTER (History & Votes)
           ======================= */}
        

       
 {/* Community Votes - Now visible for ALL types */}
        <SectionCard title="Community Votes" icon={Vote} isDarkMode={isDarkMode}>
          <div className="grid grid-cols-2 gap-4 text-center">
             <div className="p-2 rounded bg-green-500/10 text-green-500 border border-green-500/20">
               <div className="text-2xl font-bold">{attributes.total_votes?.harmless || 0}</div>
               <div className="text-[10px] uppercase font-bold">Harmless</div>
             </div>
             <div className="p-2 rounded bg-red-500/10 text-red-500 border border-red-500/20">
               <div className="text-2xl font-bold">{attributes.total_votes?.malicious || 0}</div>
               <div className="text-[10px] uppercase font-bold">Malicious</div>
             </div>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
};

export default DetailsTab;