export interface Property {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export function PropertyTable({ properties }: { properties: Property[] }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">
              Name
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">
              Type
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">
              Required
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">
              Default
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop, i) => (
            <tr key={prop.name} className={i % 2 === 1 ? "bg-muted/30" : ""}>
              <td className="px-4 py-2.5">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-orange">
                  {prop.name}
                </code>
              </td>
              <td className="px-4 py-2.5">
                <code className="font-mono text-xs text-muted-foreground">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-2.5">
                {prop.required ? (
                  <span className="text-xs font-medium text-red-500">Yes</span>
                ) : (
                  <span className="text-xs text-muted-foreground">No</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                {prop.default ? (
                  <code className="font-mono text-xs text-muted-foreground">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
