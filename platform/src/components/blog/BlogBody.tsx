import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitBody } from "@/lib/blog/body";
import { BlogPreset } from "./BlogPresets";

export default function BlogBody({ body }: { body: string }) {
  const segments = splitBody(body);
  return (
    <div>
      {segments.map((s, i) =>
        s.type === "preset" ? (
          <BlogPreset key={i} id={s.id} />
        ) : (
          <div key={i} className="prose blog-prose">
            <Markdown remarkPlugins={[remarkGfm]}>{s.text}</Markdown>
          </div>
        ),
      )}
    </div>
  );
}
