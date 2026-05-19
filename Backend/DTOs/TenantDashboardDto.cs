

namespace Backend.DTOs
{
    public class TenantDashboardDto
{
    public OutstandingSummaryDto OutstandingSummary { get; set; } = new();
    public ActiveBillsDto ActiveBills { get; set; } = new();
    public AgreementDetailsDto AgreementDetails { get; set; } = new();
    public List<RecentPaymentDto> RecentPayments { get; set; } = new();
    public List<MonthlyBillChartDto> MonthlyBillChart { get; set; } = new();
    public PaidVsOutstandingDto CurrentMonthPaidVsOutstanding { get; set; } = new();
}
}