

namespace Backend.DTOs
{
    public class AdminDashboardDto
{
    public decimal TotalRevenueThisMonth { get; set; }
    public decimal TotalOutstandingAllTenants { get; set; }
    public decimal TotalBankBalance { get; set; }
    public int ActiveTenantCount { get; set; }
    public int SystemOverdueCount { get; set; }
    public List<BankSummaryDto> BankSummary { get; set; } = new();
    public List<UserCollectionDto> UserCollectionSummary { get; set; } = new();
    public List<MonthlyRevenueChartDto> MonthlyRevenueChart { get; set; } = new();
    public RevenueByTypeDto RevenueByTypeChart { get; set; } = new();
    public List<BankBalanceChartDto> BankBalanceChart { get; set; } = new();
    public List<CollectionEfficiencyDto> CollectionEfficiencyChart { get; set; } = new();
}
}