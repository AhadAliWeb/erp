

namespace Backend.DTOs
{
    public class CollectionEfficiencyDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Billed { get; set; }
    public decimal Collected { get; set; }
}
}