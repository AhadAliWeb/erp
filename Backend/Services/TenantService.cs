// TenantService.cs Logic


// GetAllTenantsAsync

// Return all tenants where Status = "Active"
// Map to TenantResponseDto

// GetTenantByIdAsync

// Find tenant by Id
// If null → throw exception
// Map to TenantResponseDto

// UpdateTenantAsync

// Find tenant by Id
// Update only allowed fields (Company, Address, ContactPerson, ContactNumber)
// Save changes

// DeactivateTenantAsync

// Find tenant by Id
// Set Status = "Inactive"
// Set IsObsolete = true on all their active ElectricityUtilities, WaterUtilities, RentUtilities
// All in one transaction

using Backend.DTOs;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Services
{
    public class TenantService : ITenantService
    {
        private readonly AppDbContext _context;

        public TenantService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateTenantAsync(CreateTenantDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var counter = await _context.Counters.FirstOrDefaultAsync(c => c.Name == "TenantId");
            if (counter == null) throw new InvalidOperationException("Counter not found");

            counter.LastValue += 1;

            var tenant = new Tenant
            {
                Id = counter.LastValue,
                Company = dto.Company,
                Address = dto.Address,
                Category = dto.Category,
                ContactPerson = dto.ContactPerson,
                ContactNumber = dto.ContactNumber,
                MonthlyRent = dto.MonthlyRent,
                IncrementPercentage = dto.IncrementPercentage,
                AgreementDate = dto.AgreementDate,
                EndDate = dto.EndDate,
                ElectricityOutstanding = 0,
                WaterOutstanding = 0,
                RentOutstanding = 0,
                RentUpdated = false,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return tenant.Id;
        }

        public async Task<List<TenantResponseDto>> GetAllTenantsAsync()
        {
            return await _context.Tenants
                .Where(t => t.Status == "Active")
                .Select(t => new TenantResponseDto
                {
                    Id = t.Id,
                    Company = t.Company,
                    Address = t.Address,
                    Category = t.Category,
                    ContactPerson = t.ContactPerson,
                    ContactNumber = t.ContactNumber,
                    MonthlyRent = t.MonthlyRent,
                    IncrementPercentage = t.IncrementPercentage,
                    AgreementDate = t.AgreementDate,
                    EndDate = t.EndDate,
                    ElectricityOutstanding = t.ElectricityOutstanding,
                    WaterOutstanding = t.WaterOutstanding,
                    RentOutstanding = t.RentOutstanding,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<TenantResponseDto>> GetInactiveTenantsAsync()
        {
            return await _context.Tenants
                .Where(t => t.Status == "Inactive")
                .Select(t => new TenantResponseDto
                {
                    Id = t.Id,
                    Company = t.Company,
                    Address = t.Address,
                    Category = t.Category,
                    ContactPerson = t.ContactPerson,
                    ContactNumber = t.ContactNumber,
                    MonthlyRent = t.MonthlyRent,
                    IncrementPercentage = t.IncrementPercentage,
                    AgreementDate = t.AgreementDate,
                    EndDate = t.EndDate,
                    ElectricityOutstanding = t.ElectricityOutstanding,
                    WaterOutstanding = t.WaterOutstanding,
                    RentOutstanding = t.RentOutstanding,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<TenantResponseDto?> GetTenantByIdAsync(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return null;

            return new TenantResponseDto
            {
                Id = tenant.Id,
                Company = tenant.Company,
                Address = tenant.Address,
                Category = tenant.Category,
                ContactPerson = tenant.ContactPerson,
                ContactNumber = tenant.ContactNumber,
                MonthlyRent = tenant.MonthlyRent,
                IncrementPercentage = tenant.IncrementPercentage,
                AgreementDate = tenant.AgreementDate,
                EndDate = tenant.EndDate,
                ElectricityOutstanding = tenant.ElectricityOutstanding,
                WaterOutstanding = tenant.WaterOutstanding,
                RentOutstanding = tenant.RentOutstanding,
                Status = tenant.Status,
                CreatedAt = tenant.CreatedAt
            };
        }

        public async Task<bool> UpdateTenantAsync(int id, UpdateTenantDto dto)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return false;

            tenant.Company = dto.Company;
            tenant.Address = dto.Address;
            tenant.ContactPerson = dto.ContactPerson;
            tenant.ContactNumber = dto.ContactNumber;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateTenantAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return false;

            tenant.Status = "Inactive";

            // Cascade IsObsolete
            await _context.ElectricityUtilities
                .Where(e => e.TenantId == id && !e.IsObsolete)
                .ExecuteUpdateAsync(e => e.SetProperty(x => x.IsObsolete, true));

            await _context.WaterUtilities
                .Where(w => w.TenantId == id && !w.IsObsolete)
                .ExecuteUpdateAsync(w => w.SetProperty(x => x.IsObsolete, true));

            await _context.RentUtilities
                .Where(r => r.TenantId == id && !r.IsObsolete)
                .ExecuteUpdateAsync(r => r.SetProperty(x => x.IsObsolete, true));

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }

        public async Task<bool> CreateReAgreementAsync(int tenantId, ReAgreementDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var tenant = await _context.Tenants.FindAsync(tenantId);
            if (tenant == null || tenant.Status != "Active")
                throw new InvalidOperationException("Tenant not found or inactive");

            tenant.MonthlyRent = dto.MonthlyRent;
            tenant.IncrementPercentage = dto.YearlyIncrement;
            tenant.AgreementDate = dto.AgreementDate;
            tenant.EndDate = dto.EndDate;
            tenant.RentUpdated = false;

            var reAgreement = new TenantReAgreement
            {
                TenantId = tenantId,
                MonthlyRent = dto.MonthlyRent,
                YearlyIncrement = dto.YearlyIncrement,
                AgreementDate = dto.AgreementDate,
                EndDate = dto.EndDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.TenantReAgreements.Add(reAgreement);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }

        public async Task<List<ReAgreementResponseDto>> GetReAgreementsAsync(int tenantId)
        {
            return await _context.TenantReAgreements
                .Where(r => r.TenantId == tenantId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReAgreementResponseDto
                {
                    Id = r.Id,
                    TenantId = r.TenantId,
                    MonthlyRent = r.MonthlyRent,
                    YearlyIncrement = r.YearlyIncrement,
                    AgreementDate = r.AgreementDate,
                    EndDate = r.EndDate,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

    }
}