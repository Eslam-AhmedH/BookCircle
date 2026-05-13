using BookCircle.Core.DTOs.BorrowRequests;

namespace BookCircle.Core.Interfaces.Services;

public interface IBorrowRequestService
{
    Task<IEnumerable<BorrowRequestDto>> GetIncomingAsync(string ownerId);
    Task<IEnumerable<BorrowRequestDto>> GetMineAsync(string requesterId);
    Task<BorrowRequestDto> CreateAsync(string requesterId, CreateBorrowRequestDto dto);
    Task<BorrowRequestDto> RespondAsync(int id, string ownerId, string ownerRole, RespondBorrowRequestDto dto);
    Task<BorrowRequestDto> ReturnAsync(int id, string ownerId, string ownerRole);
}
