import React from "react";
import { refundPolicyHtml } from "../config/policies";

const RefundPolicyClient = () => {
  return (
    <div className="mx-auto w-[90%] max-w-6xl my-10">
      {refundPolicyHtml.map((section, i) => (
        <div
          key={i}
          className="prose prose-slate max-w-none px-4 md:px-0"
          dangerouslySetInnerHTML={{ __html: section }}
        />
      ))}
    </div>
  );
};

export default RefundPolicyClient;
