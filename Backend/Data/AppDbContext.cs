using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantReAgreement> TenantReAgreements { get; set; }
    public DbSet<ElectricityUtility> ElectricityUtilities { get; set; }
    public DbSet<WaterUtility> WaterUtilities { get; set; }
    public DbSet<RentUtility> RentUtilities { get; set; }
    public DbSet<ElectricityBill> ElectricityBills { get; set; }
    public DbSet<WaterBill> WaterBills { get; set; }
    public DbSet<RentBill> RentBills { get; set; }
    public DbSet<Bank> Banks { get; set; }
    public DbSet<BankTransaction> BankTransactions { get; set; }
    public DbSet<ProductionCommission> ProductionCommissions { get; set; }
    public DbSet<ProductionSlip> ProductionSlips { get; set; }
    public DbSet<ProductionVoucher> ProductionVouchers { get; set; }
    public DbSet<UtilityConfig> UtilityConfigs { get; set; }
    public DbSet<WaterUtilityConfig> WaterUtilityConfigs { get; set; }
    public DbSet<Counter> Counters { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Tenant: manual ID, no auto-increment ─────────────
        modelBuilder.Entity<Tenant>()
            .Property(t => t.Id)
            .ValueGeneratedNever();

        // ── Disable all cascade deletes globally ──────────────
        foreach (var relationship in modelBuilder.Model.GetEntityTypes()
            .SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // ── Decimal Precision (18,2) for all entities ─────────
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var prop in entityType.GetProperties()
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                prop.SetPrecision(18);
                prop.SetScale(2);
            }
        }

        // ── Seed: Counter ─────────────────────────────────────
        modelBuilder.Entity<Counter>().HasData(
            new Counter { Id = 1, Name = "TenantId", LastValue = 999 }
        );

        // ── Seed: UtilityConfig ───────────────────────────────
        // modelBuilder.Entity<UtilityConfig>().HasData(
        //     new UtilityConfig
        //     {
        //         Id = 1,
        //         RatePerUnit = 0,
        //         FixedCharges = 0,
        //         SSTPercentage = 0,
        //         OverdueSurchargePercentage = 0,
        //         UpdatedAt = DateTime.UtcNow,
        //         UpdatedBy = 2
        //     }
        // );

        // // ── Seed: WaterUtilityConfig ──────────────────────────
        // modelBuilder.Entity<WaterUtilityConfig>().HasData(
        //     new WaterUtilityConfig
        //     {
        //         Id = 1,
        //         RatePerUnit = 0,
        //         FixedCharges = 0,
        //         SSTPercentage = 0,
        //         OverdueSurchargePercentage = 0,
        //         UpdatedAt = DateTime.UtcNow,
        //         UpdatedBy = 2
        //     }
        // );

        // ── Seed: Admin User ──────────────────────────────────
        // modelBuilder.Entity<User>().HasData(
        //     new User
        //     {
        //         Id = 1,
        //         Name = "Super Admin",
        //         Email = "admin@psfcl.com",
        //         PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345"),
        //         Role = "Admin",
        //         IsActive = true,
        //         CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        //     }
        // );
    }
}