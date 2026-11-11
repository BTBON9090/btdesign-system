import { List, ListItem, ListItemContent, ListItemActions } from '@btdesign/react';
import { sampleImage } from './ImageExample';
import { listPreviewItems, type ListPreviewOptions } from './ListExample';
export function ListPreview({ options }: { options: ListPreviewOptions }) {
  const grid = options.mode === 'grid';
  return (
    <List
      className="enterprise-wide"
      layout={grid ? 'grid' : 'vertical'}
      columns={options.columns}
      bordered={options.bordered}
      split={options.split}
    >
      {listPreviewItems.map((name) => (
        <ListItem
          key={name}
          leading={!grid ? <span aria-hidden="true">◆</span> : undefined}
          extra={
            options.mode === 'advanced' ? (
              <img src={sampleImage} alt={`${name}的示例图片`} width={100} />
            ) : undefined
          }
        >
          <ListItemContent>
            <strong>{name}</strong>
            <p>设计与研发共同维护</p>
          </ListItemContent>
          <ListItemActions>
            <details>
              <summary>详情</summary>示例项目
            </details>
          </ListItemActions>
        </ListItem>
      ))}
    </List>
  );
}
