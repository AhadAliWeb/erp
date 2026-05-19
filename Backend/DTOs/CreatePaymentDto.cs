
namespace Backend.DTOs
{
    public class CreatePaymentDto
    {
        public int UtilityId { get; set; }
        public string BillType { get; set; } = String.Empty;
        public decimal Amount { get; set; }
        public string ModeOfPayment { get; set; } = String.Empty;
        public string? ChequeNo { get; set; }
        public string? PayOrderNo { get; set; }
        public int? BankId { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}