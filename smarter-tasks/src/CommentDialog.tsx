import React from "react";
import { Dialog } from "@headlessui/react";

type CommentDialogProps = {
  task: {
    id: string;
    title: string;
    comments: string[];
  };
  onClose: () => void;
  onAddComment: (text: string) => void;
};

const CommentDialogFC = ({ task, onClose, onAddComment }: CommentDialogProps) => {
  const [text, setText] = React.useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText("");
  };

  return (
    <Dialog open onClose={onClose} className="comment-dialog-overlay">
      <div className="comment-dialog-panel">
        <Dialog.Panel>
          <Dialog.Title className="comment-dialog-title">
            Comments — {task.title}
          </Dialog.Title>

          <div className="comment-dialog-body">
            {task.comments.length === 0 && (
              <p className="comment-dialog-empty">No comments yet.</p>
            )}
            <ul className="comment-dialog-list">
              {task.comments.map((c, idx) => (
                <li key={idx} className="comment-dialog-item">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="comment-dialog-form">
            <textarea
              className="comment-dialog-input"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <button type="button" onClick={submit} className="task-btn save">
              Add comment
            </button>
          </div>

          <button
            type="button"
            className="task-btn cancel"
            style={{ marginTop: 12 }}
            onClick={onClose}
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const CommentDialog = CommentDialogFC;

export default CommentDialog;
