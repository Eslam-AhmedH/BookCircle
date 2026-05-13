using BookCircle.Core.DTOs.Books;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookCircle.Infrastructure.Repositories;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    public BookRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<Book> Books, int Total)> GetAllAsync(BookQueryParams p)
    {
        var query = _context.Books
            .Include(b => b.Owner)
            .Include(b => b.Reactions)
            .Where(b => b.IsApproved)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(p.Q))
        {
            var search = p.Q.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(search) ||
                b.Author.ToLower().Contains(search) ||
                b.Genre.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(p.Genre))
            query = query.Where(b => b.Genre.ToLower() == p.Genre.ToLower());

        if (!string.IsNullOrWhiteSpace(p.Language))
            query = query.Where(b => b.Language.ToLower() == p.Language.ToLower());

        if (p.MaxPrice.HasValue)
            query = query.Where(b => b.BorrowPrice <= p.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(p.Status) &&
            Enum.TryParse<BookStatus>(p.Status, true, out var status))
            query = query.Where(b => b.Status == status);

        query = p.SortBy?.ToLower() switch
        {
            "borrowprice" => p.SortDir?.ToLower() == "asc"
                ? query.OrderBy(b => b.BorrowPrice)
                : query.OrderByDescending(b => b.BorrowPrice),
            "title" => p.SortDir?.ToLower() == "asc"
                ? query.OrderBy(b => b.Title)
                : query.OrderByDescending(b => b.Title),
            _ => p.SortDir?.ToLower() == "asc"
                ? query.OrderBy(b => b.CreatedAt)
                : query.OrderByDescending(b => b.CreatedAt)
        };

        var total = await query.CountAsync();
        var books = await query
            .Skip((p.Page - 1) * p.Limit)
            .Take(p.Limit)
            .ToListAsync();

        return (books, total);
    }

    public async Task<Book?> GetByIdAsync(int id)
        => await _context.Books
            .Include(b => b.Owner)
            .Include(b => b.Reactions)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<IEnumerable<Book>> GetByOwnerIdAsync(string ownerId)
        => await _context.Books
            .Include(b => b.Owner)
            .Include(b => b.Reactions)
            .Where(b => b.OwnerId == ownerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Book>> GetPendingBooksAsync()
        => await _context.Books
            .Include(b => b.Owner)
            .Include(b => b.Reactions)
            .Where(b => !b.IsApproved)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<BookReaction?> GetReactionAsync(int bookId, string userId)
        => await _context.BookReactions
            .FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId);

    public async Task AddAsync(Book book) => await _context.Books.AddAsync(book);
    public void Update(Book book) => _context.Books.Update(book);
    public void Delete(Book book) => _context.Books.Remove(book);
    public void AddReaction(BookReaction reaction) => _context.BookReactions.Add(reaction);
    public void UpdateReaction(BookReaction reaction) => _context.BookReactions.Update(reaction);
}
