import React from "react";
import { motion } from "framer-motion";
import { Loader2, Hash, Clock, FileText, Fingerprint, Cpu, Layers } from "lucide-react";
import SectionCard from "../Shared/SectionCard";
import CopyableText from "../Shared/CopyableText";

const DetailsTab = ({ metadata, isDarkMode }) => {
  if (!metadata) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500"/>
        <p>Fetching deep metadata...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Basic Properties" icon={Hash} isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CopyableText label="MD5" text={metadata.attributes.md5} isCode />
              <CopyableText label="SHA-1" text={metadata.attributes.sha1} isCode />
              <CopyableText label="SHA-256" text={metadata.attributes.sha256} isCode />
              <CopyableText label="Vhash" text={metadata.attributes.vhash} isCode />
              <CopyableText label="Authentihash" text={metadata.attributes.authentihash} isCode />
              <CopyableText label="Imphash" text={metadata.attributes.imphash} isCode />
              <CopyableText label="SSDEEP" text={metadata.attributes.ssdeep} isCode />
              <CopyableText label="File Type" text={metadata.attributes.type_description} />
              <CopyableText label="Magic" text={metadata.attributes.magic} />
              <CopyableText label="File Size" text={metadata.attributes.size ? `${(metadata.attributes.size/1024).toFixed(2)} KB` : "-"} />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="History" icon={Clock} isDarkMode={isDarkMode}>
          <div className="space-y-1">
            <CopyableText label="Creation Time" text={metadata.attributes.creation_date ? new Date(metadata.attributes.creation_date*1000).toUTCString() : "-"} />
            <CopyableText label="First Submission" text={metadata.attributes.first_submission_date ? new Date(metadata.attributes.first_submission_date*1000).toUTCString() : "-"} />
            <CopyableText label="Last Analysis" text={metadata.attributes.last_analysis_date ? new Date(metadata.attributes.last_analysis_date*1000).toUTCString() : "-"} />
          </div>
        </SectionCard>
        <SectionCard title="Names" icon={FileText} isDarkMode={isDarkMode}>
          <div className={`text-xs p-3 rounded-lg max-h-40 overflow-y-auto ${isDarkMode?"bg-zinc-900/50 text-zinc-400":"bg-gray-50 text-gray-600"}`}>
            {metadata.attributes.names?.length ? 
              metadata.attributes.names.map((n, i) => (
                <div key={i} className="mb-1 pb-1 border-b border-dashed border-current/10 last:border-0 last:mb-0">{n}</div>
              )) : 
              "No names found"
            }
          </div>
        </SectionCard>
        {metadata.attributes.signature_info && (
          <div className="lg:col-span-2">
            <SectionCard title="Signature Info" icon={Fingerprint} isDarkMode={isDarkMode}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CopyableText label="Product" text={metadata.attributes.signature_info.product} />
                <CopyableText label="Description" text={metadata.attributes.signature_info.description} />
                <CopyableText label="Original Name" text={metadata.attributes.signature_info.original_name} />
                <CopyableText label="Copyright" text={metadata.attributes.signature_info.copyright} />
                <CopyableText label="Signers" text={metadata.attributes.signature_info.signers_details?.map(s=>s.name).join("; ")} />
                <div className={`p-2 rounded border text-center text-xs font-bold uppercase ${
                  metadata.attributes.signature_info.verified 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}>
                  {metadata.attributes.signature_info.verified ? "Signature Verified" : "Invalid Signature"}
                </div>
              </div>
            </SectionCard>
          </div>
        )}
        {metadata.attributes.pe_info && (
          <div className="lg:col-span-2">
            <SectionCard title="Portable Executable Info" icon={Cpu} isDarkMode={isDarkMode}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <CopyableText label="Target Machine" text={metadata.attributes.pe_info.machine_type} />
                <CopyableText label="Entry Point" text={metadata.attributes.pe_info.entry_point} isCode />
                <CopyableText label="Sections Count" text={metadata.attributes.pe_info.sections?.length} />
              </div>
              <h4 className="text-xs font-bold uppercase opacity-50 mb-2 mt-4 flex items-center gap-1"><Layers className="w-3 h-3"/> Sections</h4>
              <div className={`overflow-x-auto rounded-lg border ${isDarkMode?"border-zinc-700":"border-gray-200"}`}>
                <table className="w-full text-xs text-left">
                  <thead className={isDarkMode?"bg-zinc-700":"bg-gray-100"}>
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Virtual Size</th>
                      <th className="p-2">Entropy</th>
                      <th className="p-2">MD5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadata.attributes.pe_info.sections?.map((s,i)=>(
                      <tr key={i} className={`border-b last:border-0 ${isDarkMode?"border-zinc-700/50":"border-gray-100"}`}>
                        <td className="p-2 font-mono text-blue-500">{s.name}</td>
                        <td className="p-2">{s.virtual_size}</td>
                        <td className="p-2">{(s.entropy ?? 0).toFixed(2)}</td>
                        <td className="p-2 font-mono opacity-50">{s.md5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DetailsTab;