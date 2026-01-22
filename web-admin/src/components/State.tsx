interface StateProps {
  title: string;
  description?: string;
}

export const LoadingState = ({ title, description }: StateProps) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center">
    <div className="text-sm font-semibold text-foreground">{title}</div>
    {description ? <div className="mt-2 text-sm text-muted-foreground">{description}</div> : null}
  </div>
);

export const EmptyState = ({ title, description }: StateProps) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center">
    <div className="text-sm font-semibold text-foreground">{title}</div>
    {description ? <div className="mt-2 text-sm text-muted-foreground">{description}</div> : null}
  </div>
);
