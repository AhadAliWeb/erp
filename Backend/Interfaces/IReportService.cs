using Backend.DTOs;


namespace Backend.Interfaces
{
    public interface IReportService
    {


        Task<byte[]> GetTenantReportAsync();
        Task<byte[]> GetBankTransactionsReportAsync(int bankId, DateTime? fromDate, DateTime? toDate);
        Task<byte[]> GetTenantBillsReportAsync(int tenantId);
        Task<byte[]> GetOutstandingReportAsync();
        Task<byte[]> GetReceivablesReportAsync();
        Task<byte[]> GetUserAmountsReportAsync();
    }
}