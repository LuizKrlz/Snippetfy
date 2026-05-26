import type { ComponentPropsWithoutRef } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AnchorProps = ComponentPropsWithoutRef<"a">;
type CodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

interface SnippetMarkdownProps {
  content: string;
}

function MarkdownLink(props: AnchorProps) {
  const href = props.href ?? "";
  const isExternal = /^https?:\/\//.test(href);

  return (
    <a
      {...props}
      className="font-medium text-emerald-300 underline underline-offset-4 transition hover:text-emerald-200"
      rel={isExternal ? "noreferrer noopener" : props.rel}
      target={isExternal ? "_blank" : props.target}
    />
  );
}

function MarkdownCode({ className, inline, ...props }: CodeProps) {
  if (inline) {
    return (
      <code
        {...props}
        className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-sm text-emerald-200"
      />
    );
  }

  return (
    <code
      {...props}
      className={className ?? "block overflow-x-auto font-mono text-sm text-slate-100"}
    />
  );
}

export function SnippetMarkdown({ content }: SnippetMarkdownProps) {
  return (
    <div className="grid gap-4 wrap-break-word text-sm leading-7 text-slate-200">
      <ReactMarkdown
        components={{
          a: MarkdownLink,
          blockquote: (props) => (
            <blockquote
              {...props}
              className="border-l-2 border-emerald-400/60 pl-4 italic text-slate-300"
            />
          ),
          code: MarkdownCode,
          h1: (props) => <h1 {...props} className="text-3xl font-semibold text-slate-50" />,
          h2: (props) => <h2 {...props} className="text-2xl font-semibold text-slate-50" />,
          h3: (props) => <h3 {...props} className="text-xl font-semibold text-slate-50" />,
          hr: (props) => <hr {...props} className="border-white/10" />,
          img: (props) => (
            <img
              {...props}
              alt={props.alt ?? ""}
              className="max-h-112 rounded-2xl border border-white/10 object-cover"
            />
          ),
          li: (props) => <li {...props} className="ml-5 list-disc" />,
          ol: (props) => <ol {...props} className="grid gap-2" />,
          p: (props) => <p {...props} className="text-slate-200" />,
          pre: (props) => (
            <pre
              {...props}
              className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4"
            />
          ),
          table: (props) => (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table {...props} className="min-w-full border-collapse text-left text-sm" />
            </div>
          ),
          td: (props) => <td {...props} className="border-t border-white/10 px-4 py-3" />,
          th: (props) => (
            <th
              {...props}
              className="bg-white/5 px-4 py-3 font-semibold tracking-wide text-slate-100"
            />
          ),
          ul: (props) => <ul {...props} className="grid gap-2" />,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
