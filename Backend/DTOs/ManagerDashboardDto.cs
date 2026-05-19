

namespace Backend.DTOs
{
    public class ManagerDashboardDto
{
    public decimal CollectionToday { get; set; }
    public decimal CollectionThisMonth { get; set; }
    public int OverdueBillsCount { get; set; }
    public int ActiveTenantCount { get; set; }
    public List<OverdueBillDto> OverdueBills { get; set; } = new();
    public List<RecentPaymentDto> RecentPayments { get; set; } = new();
    public List<TopOutstandingDto> TopOutstandingTenants { get; set; } = new();
    public List<MonthlyCollectionChartDto> MonthlyCollectionChart { get; set; } = new();
    public OverdueBillsByTypeDto OverdueBillsByTypeChart { get; set; } = new();
    public List<TopOutstandingChartDto> TopOutstandingChart { get; set; } = new();
}
}