

namespace Backend.DTOs
{
    public class RecentPaymentDto
{
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string ModeOfPayment { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

}