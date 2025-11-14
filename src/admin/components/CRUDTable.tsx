import { useNavigate } from "react-router-dom";

interface Column {
  key: string;
  label: string;
}

interface CRUDTableProps<T extends { id: string }> {
  data?: T[]; // Make optional to handle undefined gracefully
  columns: Column[];
  onDelete: (id: string ) => void;
  entityName: string;
}

const CRUDTable = <T extends { id: string  }>({
  data = [], 
  columns,
  onDelete,
  entityName,
}: CRUDTableProps<T>) => {
  const navigate = useNavigate();

  if (!Array.isArray(data)) {
    return <p className="text-red-500">Error: Invalid data format</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{entityName}</h1>
      <button
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => navigate(`/admin/${entityName.toLowerCase()}/create`)}
      >
        Add {entityName}
      </button>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="border p-2">
                {col.label}
              </th>
            ))}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col.key} className="border p-2">
                    {String(item[col.key as keyof T])}
                  </td>
                ))}
                <td className="border p-2">
                  <button
                    className="text-blue-500 mr-2"
                    onClick={() =>
                      navigate(`/admin/${entityName.toLowerCase()}/edit/${item.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="border p-4 text-center text-gray-500"
              >
                No {entityName.toLowerCase()} found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CRUDTable;
