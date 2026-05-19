

namespace Backend.DTOs
{
    public class MonthlyCollectionChartDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Electricity { get; set; }
    public decimal Water { get; set; }
    public decimal Rent { get; set; }
}
}