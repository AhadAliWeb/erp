

namespace Backend.DTOs
{
    public class ActiveBillDto
{
    public string BillingMonth { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime DueDate { get; set; }
}
}