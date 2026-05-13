using BookCircle.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BookCircle.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Book> Books => Set<Book>();
    public DbSet<BorrowRequest> BorrowRequests => Set<BorrowRequest>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<ReadingList> ReadingLists => Set<ReadingList>();
    public DbSet<ReadingListItem> ReadingListItems => Set<ReadingListItem>();
    public DbSet<BookReaction> BookReactions => Set<BookReaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ReadingListCollaborator> ReadingListCollaborators => Set<ReadingListCollaborator>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Book>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Title).IsRequired().HasMaxLength(200);
            entity.Property(b => b.Author).IsRequired().HasMaxLength(100);
            entity.Property(b => b.Genre).IsRequired().HasMaxLength(50);
            entity.Property(b => b.Language).IsRequired().HasMaxLength(50);
            entity.Property(b => b.BorrowPrice).HasColumnType("decimal(18,2)");
            entity.HasOne(b => b.Owner)
                .WithMany(u => u.Books)
                .HasForeignKey(b => b.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<BorrowRequest>(entity =>
        {
            entity.HasKey(br => br.Id);
            entity.HasOne(br => br.Book)
                .WithMany(b => b.BorrowRequests)
                .HasForeignKey(br => br.BookId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(br => br.Requester)
                .WithMany(u => u.BorrowRequests)
                .HasForeignKey(br => br.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Content).IsRequired().HasMaxLength(1000);
            entity.HasOne(c => c.Book)
                .WithMany(b => b.Comments)
                .HasForeignKey(c => c.BookId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(c => c.Parent)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ReadingList>(entity =>
        {
            entity.HasKey(rl => rl.Id);
            entity.Property(rl => rl.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(rl => rl.User)
                .WithMany(u => u.ReadingLists)
                .HasForeignKey(rl => rl.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ReadingListItem>(entity =>
        {
            entity.HasKey(rli => rli.Id);
            entity.HasIndex(rli => new { rli.ReadingListId, rli.BookId }).IsUnique();
            entity.HasOne(rli => rli.ReadingList)
                .WithMany(rl => rl.Items)
                .HasForeignKey(rli => rli.ReadingListId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rli => rli.Book)
                .WithMany(b => b.ReadingListItems)
                .HasForeignKey(rli => rli.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ReadingListCollaborator>(entity =>
        {
            entity.HasKey(rlc => new { rlc.ReadingListId, rlc.UserId });
            entity.HasOne(rlc => rlc.ReadingList)
                .WithMany(rl => rl.Collaborators)
                .HasForeignKey(rlc => rlc.ReadingListId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rlc => rlc.User)
                .WithMany()
                .HasForeignKey(rlc => rlc.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<BookReaction>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasIndex(r => new { r.BookId, r.UserId }).IsUnique();
            entity.HasOne(r => r.Book)
                .WithMany(b => b.Reactions)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.User)
                .WithMany(u => u.Reactions)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Message).IsRequired().HasMaxLength(500);
            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
