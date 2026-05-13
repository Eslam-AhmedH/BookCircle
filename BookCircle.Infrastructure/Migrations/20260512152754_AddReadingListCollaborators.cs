using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookCircle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReadingListCollaborators : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReadingListCollaborators",
                columns: table => new
                {
                    ReadingListId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingListCollaborators", x => new { x.ReadingListId, x.UserId });
                    table.ForeignKey(
                        name: "FK_ReadingListCollaborators_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReadingListCollaborators_ReadingLists_ReadingListId",
                        column: x => x.ReadingListId,
                        principalTable: "ReadingLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingListCollaborators_UserId",
                table: "ReadingListCollaborators",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReadingListCollaborators");
        }
    }
}
