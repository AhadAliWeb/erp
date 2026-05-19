// import Loader from './Loader';

// export default function Table({ columns = [], data = [], isLoading = false, emptyMessage = 'No data found' }) {
//   return (
//     <div className="overflow-x-auto">
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
//         <table className="w-full text-left border-collapse">
//           {/* Header */}
//           <thead>
//             <tr className="bg-gray-50">
//               {columns.map((col) => (
//                 <th
//                   key={col.key}
//                   className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
//                 >
//                   {col.label}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           {/* Body */}
//           <tbody>
//             {isLoading ? (
//               <tr>
//                 <td colSpan={columns.length} className="py-16 text-center relative">
//                   <div className="relative h-20">
//                     <Loader message="Loading data..." />
//                   </div>
//                 </td>
//               </tr>
//             ) : data.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={columns.length}
//                   className="px-4 py-10 text-center text-sm text-gray-400"
//                 >
//                   {emptyMessage}
//                 </td>
//               </tr>
//             ) : (
//               data.map((row, rowIdx) => (
//                 <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                   {columns.map((col) => (
//                     <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
//                       {col.render
//                         ? col.render(row[col.key], row)
//                         : row[col.key] ?? '—'}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import Loader from './Loader';

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data found',
}) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Header */}
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center"
                  >
                    <div className="relative h-20">
                      <Loader message="Loading data..." />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-gray-700"
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {data.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col.label}
                  </span>

                  <div className="text-sm text-gray-700 text-right">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}