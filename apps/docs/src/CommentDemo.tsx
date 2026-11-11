import { useState } from 'react';
import { Avatar, Button, Comment } from '@btdesign/react';
import type { CommentPreviewOptions } from './CommentExample';

export function CommentDemo({
  options,
  onAction,
}: {
  options: CommentPreviewOptions;
  onAction: (message: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="demo-form">
      <Comment
        author="林晓"
        time="1 小时前"
        content="建议补充表单校验。"
        alignment={options.alignment}
        avatar={<Avatar name="林晓" />}
        actions={
          options.showActions ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={liked}
                onClick={() => setLiked(!liked)}
              >
                {liked ? '已赞' : '赞'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onAction('已选择回复（示例）')}>
                回复
              </Button>
            </>
          ) : undefined
        }
      >
        {options.nested && <Comment author="王宁" time="刚刚" content="收到，我们一起检查。" />}
      </Comment>
    </div>
  );
}
