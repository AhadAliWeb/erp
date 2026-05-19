using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class BankService : IBankService
    {
        private readonly AppDbContext _context;

        public BankService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(CreateBankDto dto)
        {
            var duplicate = await _context.Banks
                .AnyAsync(b => b.AccountNumber == dto.AccountNumber && !b.IsDeleted);
            if (duplicate)
                throw new InvalidOperationException("Account number already exists");

            var bank = new Bank
            {
                BankName = dto.BankName,
                AccountNumber = dto.AccountNumber,
                AccountTitle = dto.AccountTitle,
                OpeningBalance = dto.OpeningBalance,
                CurrentBalance = dto.OpeningBalance,
                OpeningDate = dto.OpeningDate,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Banks.Add(bank);
            await _context.SaveChangesAsync();

            return bank.Id;
        }

        public async Task<List<BankResponseDto>> GetAllAsync()
        {
            return await _context.Banks
                .Where(b => !b.IsDeleted)
                .Select(b => new BankResponseDto
                {
                    Id = b.Id,
                    BankName = b.BankName,
                    AccountNumber = b.AccountNumber,
                    AccountTitle = b.AccountTitle,
                    OpeningBalance = b.OpeningBalance,
                    CurrentBalance = b.CurrentBalance,
                    OpeningDate = b.OpeningDate,
                    IsDeleted = b.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<BankResponseDto> GetByIdAsync(int id)
        {
            var bank = await _context.Banks
                .Where(b => b.Id == id && !b.IsDeleted)
                .Select(b => new BankResponseDto
                {
                    Id = b.Id,
                    BankName = b.BankName,
                    AccountNumber = b.AccountNumber,
                    AccountTitle = b.AccountTitle,
                    OpeningBalance = b.OpeningBalance,
                    CurrentBalance = b.CurrentBalance,
                    OpeningDate = b.OpeningDate,
                    IsDeleted = b.IsDeleted
                })
                .FirstOrDefaultAsync();

            if (bank == null)
                throw new KeyNotFoundException("Bank not found");

            return bank;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var bank = await _context.Banks.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
            if (bank == null)
                return false;

            bank.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeductAsync(DeductFromBankDto dto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var bank = await _context.Banks.FindAsync(dto.BankId);
            if (bank == null || bank.IsDeleted)
                throw new InvalidOperationException("Bank not found");

            if (dto.Amount <= 0)
                throw new InvalidOperationException("Amount must be greater than 0");

            if (dto.Amount > bank.CurrentBalance)
                throw new InvalidOperationException("Insufficient bank balance");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");

            bank.CurrentBalance -= dto.Amount;

            _context.BankTransactions.Add(new BankTransaction
            {
                BankId = dto.BankId,
                Type = "Debit",
                Amount = dto.Amount,
                Description = dto.Description,
                CreatedBy = $"{user.Name} - {userId}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }

        public async Task<PagedResultDto<BankTransactionResponseDto>> GetTransactionsAsync(int bankId, int pageNumber, int pageSize, string? type, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.BankTransactions
                .Where(t => t.BankId == bankId);

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(t => t.Type == type);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt <= toDate.Value);
            }

            var totalCount = await query.CountAsync();

            var transactions = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new BankTransactionResponseDto
                {
                    Id = t.Id,
                    BankId = t.BankId,
                    BankName = t.Bank.BankName,
                    Type = t.Type,
                    Amount = t.Amount,
                    Description = t.Description,
                    CreatedBy = t.CreatedBy,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return new PagedResultDto<BankTransactionResponseDto>
            {
                Data = transactions,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }


    }
}