namespace Backend.DTOs
{
    public class ReportRequestDto
    {
        public int? BankId { get; set; }
        public int? TenantId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}