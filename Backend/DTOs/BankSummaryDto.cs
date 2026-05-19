

namespace Backend.DTOs
{
    public class BankSummaryDto
{
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public decimal CurrentBalance { get; set; }
}
}