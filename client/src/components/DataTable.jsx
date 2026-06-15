import React from 'react';

const DataTable = ({ columns, data, keyField = 'id', onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="table-container animate-fade-in">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable-row' : ''}
            >
              {columns.map((col, idx) => (
                <td key={idx} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.field], row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
