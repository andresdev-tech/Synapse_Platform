import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export function SortableItem(props: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes} 
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        title="Arrastrar"
      >
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      {props.children}
    </div>
  )
}
