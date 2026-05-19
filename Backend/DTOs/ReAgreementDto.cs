namespace Backend.DTOs
{
    public class ReAgreementDto
    {
        public decimal MonthlyRent { get; set; }
        public decimal YearlyIncrement { get; set; }
        public DateTime AgreementDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}