import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { useEffect } from "react";

const RichTextEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  // ✅ Formats must match Quill’s built-in names
  const formats = [
    "header",
    "bold", "italic", "underline", "strike", "blockquote",
    "list",   // needed for ordered/bullet lists
    "indent",
    "link", "image",
  ];

  const { quill, quillRef } = useQuill({ modules, formats, theme: "snow" });

  useEffect(() => {
    if (!quill) return;

    // Set initial content
    if (value && quill.root.innerHTML !== value) {
      quill.root.innerHTML = value;
    }

    // Handle content changes
    quill.on("text-change", () => {
      const content = quill.root.innerHTML;
      if (onChange) {
        onChange(content);
      }
    });
  }, [quill, value, onChange]);

  return (
    <div
      ref={quillRef}
      style={{ height: "300px" }}
      className="bg-white rounded-lg shadow"
    />
  );
};

export default RichTextEditor;
