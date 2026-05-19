namespace Backend.DTOs
{
    public class CreateProductionVoucherDto
    {
        public int ProductionCommissionId { get; set; }
        public string ModeOfPayment { get; set; } = String.Empty;
        public string? ChequeNo { get; set; }
        public string? PayOrderNo { get; set; }
        public int? BankId { get; set; }
    }
}