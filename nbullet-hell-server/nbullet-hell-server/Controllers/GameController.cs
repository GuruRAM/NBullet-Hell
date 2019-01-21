using Microsoft.AspNetCore.Mvc;
using nbullet_hell_server.Models;
using nbullet_hell_server.Services;

namespace nbullet_hell_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private PlayerService playerService;

        public GameController(PlayerService playerService)
        {
            this.playerService = playerService;
        }

        [HttpPut("{name}")]
        public void AddGame(string name, [FromBody] Game game)
        {
            playerService.AddGame(name, game);
        }
    }
}
