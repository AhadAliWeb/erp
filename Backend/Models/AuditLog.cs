



namespace Backend.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; } = String.Empty;
        public string Entity { get; set; } = String.Empty;
        public string EntityId { get; set; } = String.Empty;
        public string Details { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}