using System;

namespace nbullet_hell_server.Models
{
    public class Game
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Score { get; set; }
    }
}
