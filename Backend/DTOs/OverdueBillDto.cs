

namespace Backend.DTOs
{
    public class OverdueBillDto
{
    public string TenantName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime OverdueSince { get; set; }
    public decimal Amount { get; set; }
}

}