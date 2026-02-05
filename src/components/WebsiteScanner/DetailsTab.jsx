import React from "react";
import { motion } from "framer-motion";
import { 
  Loader2, Hash, Clock, FileText, Fingerprint, Cpu, Layers, 
  Globe, Link as LinkIcon, Server, ListTree, Code, ArrowRight, ShieldAlert 
} from "lucide-react";
import SectionCard from "../Shared/SectionCard";
import CopyableText from "../Shared/CopyableText";

const DetailsTab = ({ metadata, isDarkMode }) => {
  // 1. Loading State
  if (!metadata) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500"/>
        <p>Fetching deep metadata...</p>
      </div>
    );
  }

  // 2. Safe Data Extraction
  const attributes = metadata?.attributes || {};
  const type = metadata?.type || attributes.type_description || "unknown";
  
  // Deteksi apakah ini URL berdasarkan keberadaan atribut 'url' atau tipe
  const isUrl = !!attributes.url || type === 'url';

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

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* =======================
            SECTION 1: BASIC INFO 
           ======================= */}
        <div className="lg:col-span-2">
          <SectionCard 
            title={isUrl ? "URL Properties" : "File Properties"} 
            icon={isUrl ? Globe : Hash} 
            isDarkMode={isDarkMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {isUrl ? (
                // --- URL SPECIFIC BASIC INFO ---
                <>
                  <div className="md:col-span-2">
                    <CopyableText label="Target URL" text={attributes.url || "-"} />
                  </div>
                  <div className="md:col-span-2">
                    <CopyableText label="Final URL" text={attributes.last_final_url || attributes.url || "-"} />
                  </div>
                  <CopyableText label="Page Title" text={attributes.title || "-"} />
                  <div className="flex flex-col space-y-1">
                     <span className="text-xs font-bold uppercase opacity-50">HTTP Status</span>
                     <span className={`font-mono text-sm ${getHttpCodeColor(attributes.last_http_response_code)}`}>
                       {attributes.last_http_response_code || "-"}
                     </span>
                  </div>
                  <CopyableText label="Content Length" text={formatSize(attributes.last_http_response_content_length)} />
                  <CopyableText label="Content SHA-256" text={attributes.last_http_response_content_sha256 || "-"} isCode />
                  <CopyableText label="Serving IP" text={attributes.last_http_response_ip_address || "-"} />
                </>
              ) : (
                // --- FILE SPECIFIC BASIC INFO ---
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
            </div>
          </SectionCard>
        </div>

        {/* =======================
            SECTION 2: URL DETAILS 
           ======================= */}
        {isUrl && (
          <>
            {/* HTML META & CATEGORIES */}
            <SectionCard title="Web Content Info" icon={Code} isDarkMode={isDarkMode}>
              <div className="space-y-4">
                {/* Categories */}
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
                
                {/* HTML Meta */}
                {attributes.html_meta && (
                   <div className="grid grid-cols-1 gap-3">
                      <CopyableText label="Description" text={attributes.html_meta.description || "-"} />
                      <CopyableText label="Keywords" text={attributes.html_meta.keywords ? attributes.html_meta.keywords.join(", ") : "-"} />
                   </div>
                )}

                {/* Threat Names (If Any) */}
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
             {/* =======================
            SECTION 4: HISTORY (Shared)
           ======================= */}
        <SectionCard title="Scan History" icon={Clock} isDarkMode={isDarkMode}>
          <div className="space-y-1">
            <CopyableText label="Creation Date" text={formatDate(attributes.creation_date)} />
            <CopyableText label="First Submission" text={formatDate(attributes.first_submission_date)} />
            <CopyableText label="Last Analysis" text={formatDate(attributes.last_analysis_date)} />
            {isUrl && <CopyableText label="Last Modification" text={formatDate(attributes.last_modification_date)} />}
          </div>
        </SectionCard>

            {/* REDIRECTION CHAIN */}
            {(attributes.redirection_chain || attributes.last_http_response_headers) && (
              <div className="lg:col-span-2">
                 <SectionCard title="Network & Response" icon={ListTree} isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Redirection Chain */}
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

                      {/* HTTP Headers */}
                      {attributes.last_http_response_headers && (
                        <div>
                           <h4 className="text-xs font-bold uppercase opacity-50 mb-3 flex items-center gap-1"><Server className="w-3 h-3"/> Response Headers</h4>
                           <div className={`p-3 rounded-lg text-xs font-mono max-h-60 overflow-y-auto border ${isDarkMode ? "bg-zinc-900/50 border-zinc-700 text-zinc-400" : "bg-white border-gray-200 text-gray-600"}`}>
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
            SECTION 3: FILE DETAILS (Only for Files)
           ======================= */}
        {!isUrl && (
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
              </div>
            )}
          </>
        )}

       

      </div>
    </motion.div>
  );
};

export default DetailsTab;