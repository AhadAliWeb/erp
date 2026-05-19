namespace Backend.DTOs
{
    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public int UtilityId { get; set; }
        public int TenantId { get; set; }
        public string CompanyName { get; set; } = String.Empty;
        public string BillType { get; set; } = String.Empty;
        public decimal Amount { get; set; }
        public string ModeOfPayment { get; set; } = String.Empty;
        public string? ChequeNo { get; set; }
        public string? PayOrderNo { get; set; }
        public int? BankId { get; set; }
        public string? BankName { get; set; }
        public DateTime PaymentDate { get; set; }
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}