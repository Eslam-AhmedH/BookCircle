using BookCircle.Core.DTOs.Auth;
using BookCircle.Core.DTOs.Books;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Identity;

namespace BookCircle.Core.Services;

public class AdminService : IAdminService
{
    private readonly UserManager<User> _userManager;
    private readonly IBookRepository _bookRepo;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _uow;

    public AdminService(
        UserManager<User> userManager,
        IBookRepository bookRepo,
        INotificationService notificationService,
        IUnitOfWork uow)
    {
        _userManager = userManager;
        _bookRepo = bookRepo;
        _notificationService = notificationService;
        _uow = uow;
    }

    public async Task<IEnumerable<UserDto>> GetPendingUsersAsync()
    {
        var pendingOwners = _userManager.Users
            .Where(u => u.Role == UserRole.Owner && !u.IsApproved)
            .ToList();
        return pendingOwners.Select(MapToUserDto);
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = _userManager.Users.ToList();
        return users.Select(MapToUserDto);
    }

    public async Task ApproveUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");

        if (user.Role != UserRole.Owner)
            throw new InvalidOperationException("Only Owner accounts require approval");

        if (user.IsApproved)
            throw new InvalidOperationException("User is already approved");

        user.IsApproved = true;
        await _userManager.UpdateAsync(user);

        await _notificationService.CreateAsync(
            userId,
            NotificationType.BookApproved,
            "Your account has been approved! You can now list books.",
            null);
    }

    public async Task RejectUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");

        if (user.Role != UserRole.Owner)
            throw new InvalidOperationException("Only Owner accounts require approval");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to reject user: {errors}");
        }
    }

    public async Task DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");

        if (user.Role == UserRole.Admin)
            throw new InvalidOperationException("Cannot delete an Admin account");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to delete user: {errors}");
        }
    }

    public async Task<IEnumerable<BookDto>> GetPendingBooksAsync()
    {
        var books = await _bookRepo.GetPendingBooksAsync();
        return books.Select(BookService.MapToDto);
    }

    public async Task ApproveBookAsync(int bookId)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        if (book.IsApproved)
            throw new InvalidOperationException("Book is already approved");

        book.IsApproved = true;
        _bookRepo.Update(book);
        await _uow.SaveChangesAsync();

        await _notificationService.CreateAsync(
            book.OwnerId,
            NotificationType.BookApproved,
            $"Your book \"{book.Title}\" has been approved and is now visible to readers!",
            book.Id);
    }

    public async Task RejectBookAsync(int bookId)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        var ownerId = book.OwnerId;
        var bookTitle = book.Title;

        _bookRepo.Delete(book);
        await _uow.SaveChangesAsync();

        await _notificationService.CreateAsync(
            ownerId,
            NotificationType.BookRejected,
            $"Your book \"{bookTitle}\" was not approved by the admin.",
            bookId);
    }

    private static UserDto MapToUserDto(User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email!,
        Role = u.Role.ToString(),
        AvatarUrl = u.AvatarUrl,
        IsApproved = u.IsApproved
    };
}
