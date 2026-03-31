import pygame
import sys

pygame.init()

WIDTH, HEIGHT = 950, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Startup Simulation")

font = pygame.font.SysFont("arial", 22, bold=True)
small_font = pygame.font.SysFont("arial", 18)
large_font = pygame.font.SysFont("arial", 32, bold=True)
emoji_font = pygame.font.SysFont("seguiemj", 36)

# Color scheme
COLOR_SKY = (100, 200, 255)
COLOR_CLOUD = (255, 255, 255)
COLOR_GRASS = (76, 175, 80)
COLOR_GRASS_DARK = (56, 142, 60)
COLOR_DIRT = (139, 69, 19)
COLOR_ACTIVE = (100, 180, 255)
COLOR_INACTIVE = (200, 220, 240)
COLOR_OPTION_HOVER = (150, 200, 255)
COLOR_OPTION_NORMAL = (220, 235, 255)
COLOR_SHADOW = (0, 0, 0, 30)
COLOR_TEXT = (20, 40, 80)


def draw_background(surface):
    """Draw pixel art style background with sky, clouds, grass, and dirt"""
    # Sky
    surface.fill(COLOR_SKY)
    
    # Clouds
    cloud_positions = [(80, 40), (350, 60), (650, 30), (850, 80)]
    for cx, cy in cloud_positions:
        # Cloud made of circles
        pygame.draw.circle(surface, COLOR_CLOUD, (cx, cy), 25)
        pygame.draw.circle(surface, COLOR_CLOUD, (cx + 30, cy), 22)
        pygame.draw.circle(surface, COLOR_CLOUD, (cx + 55, cy), 20)
        pygame.draw.circle(surface, COLOR_CLOUD, (cx + 15, cy - 15), 18)
        pygame.draw.circle(surface, COLOR_CLOUD, (cx + 40, cy - 12), 16)
    
    # Grass layer
    grass_y = 520
    pygame.draw.line(surface, COLOR_GRASS, (0, grass_y), (WIDTH, grass_y), 8)
    pygame.draw.line(surface, COLOR_GRASS, (0, grass_y + 3), (WIDTH, grass_y + 3), 8)
    
    # Grass pattern (simple pixelated grass)
    for x in range(0, WIDTH, 30):
        pygame.draw.line(surface, COLOR_GRASS_DARK, (x, grass_y - 4), (x + 15, grass_y - 8), 2)
        pygame.draw.line(surface, COLOR_GRASS_DARK, (x + 20, grass_y - 4), (x + 35, grass_y - 8), 2)
    
    # Dirt layers
    dirt_start = grass_y + 15
    dirt_layer_height = (HEIGHT - dirt_start) // 3
    
    colors = [COLOR_DIRT, (120, 60, 15), (100, 50, 10)]
    for i, color in enumerate(colors):
        rect = pygame.Rect(0, dirt_start + i * dirt_layer_height, WIDTH, dirt_layer_height)
        pygame.draw.rect(surface, color, rect)


def draw_text_fit(surface, text, font, color, rect):
    text_surf = font.render(text, True, color)
    if text_surf.get_width() <= rect.width - 8:
        surface.blit(text_surf, text_surf.get_rect(center=rect.center))
        return

    base_name = "arial"
    base_size = font.get_height() if hasattr(font, "get_height") else 24
    size = base_size

    while size > 10:
        size -= 1
        scaled_font = pygame.font.SysFont(base_name, size)
        text_surf = scaled_font.render(text, True, color)
        if text_surf.get_width() <= rect.width - 8:
            surface.blit(text_surf, text_surf.get_rect(center=rect.center))
            return

    for n in range(len(text), 0, -1):
        clipped = text[:n] + "..."
        text_surf = pygame.font.SysFont(base_name, 14).render(clipped, True, color)
        if text_surf.get_width() <= rect.width - 8:
            surface.blit(text_surf, text_surf.get_rect(center=rect.center))
            return

    text_surf = pygame.font.SysFont(base_name, 14).render("...", True, color)
    surface.blit(text_surf, text_surf.get_rect(center=rect.center))


def draw_player_character(surface, x, y, scale=1.0):
    """Draw a Mario-inspired character"""
    x, y = int(x), int(y)
    
    # Head (red circle)
    head_radius = int(18 * scale)
    pygame.draw.circle(surface, (220, 20, 60), (x, y - head_radius), head_radius)
    pygame.draw.circle(surface, (180, 10, 50), (x, y - head_radius), head_radius, 2)
    
    # Eyes
    eye_offset = int(7 * scale)
    eye_radius = int(3 * scale)
    pygame.draw.circle(surface, (255, 255, 255), (x - eye_offset, y - head_radius - 2), eye_radius)
    pygame.draw.circle(surface, (255, 255, 255), (x + eye_offset, y - head_radius - 2), eye_radius)
    pygame.draw.circle(surface, (0, 0, 0), (x - eye_offset, y - head_radius - 2), int(2 * scale))
    pygame.draw.circle(surface, (0, 0, 0), (x + eye_offset, y - head_radius - 2), int(2 * scale))
    
    # Body (blue rectangle)
    body_width = int(14 * scale)
    body_height = int(20 * scale)
    body_rect = pygame.Rect(x - body_width//2, y, body_width, body_height)
    pygame.draw.rect(surface, (30, 100, 200), body_rect, border_radius=3)
    pygame.draw.rect(surface, (20, 80, 180), body_rect, 2, border_radius=3)
    
    # Legs
    leg_width = int(5 * scale)
    leg_height = int(9 * scale)
    pygame.draw.rect(surface, (200, 100, 50), (x - 7*scale, y + body_height, leg_width, leg_height), border_radius=2)
    pygame.draw.rect(surface, (200, 100, 50), (x + 2*scale, y + body_height, leg_width, leg_height), border_radius=2)


entities = [
    "Team Selection",
    "Budget Allocation",
    "Product Strategy",
    "Marketing Strategy",
    "Market Position",
    "Team Management",
    "Expansion Decision"
]

choices = {
    "Team Selection": ["Skilled", "Unskilled"],
    "Budget Allocation": ["High Spending", "Balanced", "Low Spending"],
    "Product Strategy": ["High Quality", "Medium Quality", "Low Quality"],
    "Marketing Strategy": ["Celebrity", "Social Media", "Influencer", "No Marketing"],
    "Market Position": ["Competitive Pricing", "Premium Branding"],
    "Team Management": ["Train Team", "Hire More", "Do Nothing"],
    "Expansion Decision": ["Expand", "Stay Local"]
}

# Layout positions - organized horizontally across the grass
step_positions = [
    (80, 480),
    (200, 480),
    (320, 480),
    (440, 480),
    (560, 480),
    (680, 480),
    (800, 480)
]

step_width = 110
step_height = 50
step_y_offset = 20  # Offset to position blocks below character
character_feet_offset = 29  # Distance from character center to feet (body_height + leg_height)

current_step = 0
show_choices = False

money, growth, reputation = 100, 0, 50

# Player animation - start position adjusted to stand ON the first block
player_pos = [step_positions[0][0], step_positions[0][1] - step_height//2 - character_feet_offset + step_y_offset]
target_pos = list(player_pos)
start_pos = list(player_pos)

jumping = False
jump_progress = 0

# Mouse tracking for hover
mouse_pos = (0, 0)
hovered_step = -1
hovered_option = -1

running = True
while running:
    draw_background(screen)
    mouse_pos = pygame.mouse.get_pos()
    hovered_step = -1
    hovered_option = -1

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if event.type == pygame.MOUSEBUTTONDOWN:

            # Click step
            if not show_choices and current_step < len(step_positions):
                rect = pygame.Rect(step_positions[current_step][0] - step_width//2, 
                                 step_positions[current_step][1] - step_height//2 + step_y_offset, 
                                 step_width, step_height)
                if rect.collidepoint(event.pos):
                    show_choices = True

            # Click options
            elif show_choices:
                current_entity = entities[current_step]
                option_list = choices[current_entity]

                panel_y = 580
                spacing = (WIDTH - 40) // len(option_list)
                option_width = spacing - 20
                option_height = 50
                option_y = panel_y + 45

                for i, option in enumerate(option_list):
                    option_x = 30 + i * spacing + (spacing - option_width) // 2
                    option_rect = pygame.Rect(option_x, option_y, option_width, option_height)

                    if option_rect.collidepoint(event.pos):

                        # --- LOGIC ---
                        if option == "Skilled":
                            money -= 30; growth += 20
                        elif option == "Unskilled":
                            money -= 10; growth += 5

                        elif option == "High Spending":
                            money -= 40; growth += 25
                        elif option == "Balanced":
                            money -= 20; growth += 15
                        elif option == "Low Spending":
                            growth += 5

                        elif option == "High Quality":
                            money -= 30; reputation += 20
                        elif option == "Medium Quality":
                            money -= 15; reputation += 10
                        elif option == "Low Quality":
                            reputation -= 10

                        elif option == "Celebrity":
                            money -= 40; growth += 30
                        elif option == "Social Media":
                            money -= 20; growth += 15
                        elif option == "Influencer":
                            money -= 15; growth += 12
                        elif option == "No Marketing":
                            growth -= 5

                        elif option == "Competitive Pricing":
                            growth += 20
                        elif option == "Premium Branding":
                            reputation += 20

                        elif option == "Train Team":
                            money -= 15; growth += 10
                        elif option == "Hire More":
                            money -= 25; growth += 15

                        elif option == "Expand":
                            money -= 30; growth += 30
                        elif option == "Stay Local":
                            growth += 10

                        current_step += 1
                        show_choices = False

                        if current_step < len(step_positions):
                            start_pos = player_pos[:]
                            target_pos = [step_positions[current_step][0], step_positions[current_step][1] - step_height//2 - character_feet_offset + step_y_offset]
                            jumping = True
                            jump_progress = 0

    # DRAW STEPS
    for i, step in enumerate(entities):
        rect = pygame.Rect(step_positions[i][0] - step_width//2, step_positions[i][1] - step_height//2 + step_y_offset, step_width, step_height)
        
        # Check hover
        if rect.collidepoint(mouse_pos):
            hovered_step = i
        
        # Color based on state
        if i == current_step:
            color = (80, 160, 255)  # Brighter active blue
        elif i < current_step:
            color = (76, 175, 80)   # Completed - vibrant green
        else:
            color = (220, 230, 245) # Inactive - light blue
        
        # Draw box with shadow
        shadow_rect = rect.copy()
        shadow_rect.y += 2
        pygame.draw.rect(screen, (0, 0, 0, 30), shadow_rect, border_radius=8)
        
        # Draw main box
        pygame.draw.rect(screen, color, rect, border_radius=8)
        
        # Hover effect
        if hovered_step == i and not show_choices:
            hover_surf = pygame.Surface((rect.width, rect.height))
            hover_surf.set_alpha(30)
            hover_surf.fill((255, 255, 255))
            screen.blit(hover_surf, rect)
        
        # Border
        border_width = 3 if i == current_step else 2
        border_color = (40, 100, 180) if i == current_step else (100, 100, 120)
        pygame.draw.rect(screen, border_color, rect, border_width, border_radius=8)
        
        # Text - show step number only to keep it clean
        step_num_text = small_font.render(str(i + 1), True, (255, 255, 255) if i == current_step else COLOR_TEXT)
        step_num_rect = step_num_text.get_rect(center=rect.center)
        screen.blit(step_num_text, step_num_rect)

    # JUMP ANIMATION
    jump_scale = 1.0
    if jumping:
        jump_progress += 0.08  # Smooth jump speed

        if jump_progress >= 1:
            jumping = False
            player_pos = target_pos[:]
            jump_scale = 1.0
        else:
            # Smooth easing
            ease = jump_progress * jump_progress * (3 - 2 * jump_progress)  # smoothstep
            x = start_pos[0] + (target_pos[0] - start_pos[0]) * ease
            y = start_pos[1] + (target_pos[1] - start_pos[1]) * ease \
                - 120 * (4 * jump_progress * (1 - jump_progress))  # Higher arc
            player_pos = [x, y]
            # Scale emoji bigger when jumping higher
            jump_scale = 1.0 + 0.4 * (4 * jump_progress * (1 - jump_progress))

    # DRAW PLAYER with jump effect
    if jump_scale != 1.0:
        # Scale during jump for dramatic effect
        pass  # Dynamic scaling is handled in draw_player_character
    
    # DRAW PLAYER CHARACTER
    draw_player_character(screen, player_pos[0], player_pos[1], jump_scale)

    # DRAW BRANCH OPTIONS - Clean horizontal layout below steps
    if show_choices and current_step < len(entities):
        current_entity = entities[current_step]
        option_list = choices[current_entity]

        # Options panel background
        panel_y = 580
        panel_height = 100
        pygame.draw.rect(screen, (200, 240, 200), (20, panel_y, WIDTH - 40, panel_height), border_radius=10)
        pygame.draw.rect(screen, (76, 175, 80), (20, panel_y, WIDTH - 40, panel_height), 3, border_radius=10)
        
        # Title
        title_text = font.render(f"Choose for {current_entity}:", True, COLOR_TEXT)
        screen.blit(title_text, (40, panel_y + 10))
        
        # Options positioning
        spacing = (WIDTH - 40) // len(option_list)
        option_width = spacing - 20
        option_height = 50
        option_y = panel_y + 45

        for i, option in enumerate(option_list):
            option_x = 30 + i * spacing + (spacing - option_width) // 2
            option_rect = pygame.Rect(option_x, option_y, option_width, option_height)
            
            # Check hover
            if option_rect.collidepoint(mouse_pos):
                hovered_option = i
            
            # Draw shadow
            shadow_rect = option_rect.copy()
            shadow_rect.y += 2
            pygame.draw.rect(screen, (0, 0, 0, 25), shadow_rect, border_radius=8)

            # Color based on hover
            if hovered_option == i:
                opt_color = (80, 200, 255)
                border_color = (40, 150, 255)
                border_width = 3
            else:
                opt_color = (150, 230, 150)
                border_color = (76, 175, 80)
                border_width = 2
            
            pygame.draw.rect(screen, opt_color, option_rect, border_radius=8)
            pygame.draw.rect(screen, border_color, option_rect, border_width, border_radius=8)

            # Hover effect
            if hovered_option == i:
                hover_surf = pygame.Surface((option_rect.width, option_rect.height))
                hover_surf.set_alpha(30)
                hover_surf.fill((255, 255, 255))
                screen.blit(hover_surf, option_rect)

            text_color = (255, 255, 255) if hovered_option == i else COLOR_TEXT
            draw_text_fit(screen, option, small_font, text_color, option_rect)


    # STATS - Positioned in top right with pixel art style
    stats_panel_rect = pygame.Rect(WIDTH - 280, 10, 270, 110)
    pygame.draw.rect(screen, (255, 255, 200), stats_panel_rect, border_radius=10)
    pygame.draw.rect(screen, (200, 180, 50), stats_panel_rect, 3, border_radius=10)
    
    stats_title = font.render("STATS", True, (200, 120, 0))
    screen.blit(stats_title, (WIDTH - 260, 20))
    
    # Money
    money_color = (76, 175, 80) if money > 50 else (200, 100, 100)
    money_text = small_font.render(f"Money: ${money}", True, money_color)
    screen.blit(money_text, (WIDTH - 260, 50))
    
    # Growth
    growth_text = small_font.render(f"Growth: +{growth}", True, (100, 150, 255))
    screen.blit(growth_text, (WIDTH - 260, 70))
    
    # Reputation
    rep_text = small_font.render(f"Reputation: {reputation}", True, (255, 180, 0))
    screen.blit(rep_text, (WIDTH - 260, 90))

    # END - beautiful finish screen
    if current_step >= len(entities):
        # Semi-transparent overlay
        overlay = pygame.Surface((WIDTH, HEIGHT))
        overlay.set_alpha(180)
        overlay.fill((20, 40, 80))
        screen.blit(overlay, (0, 0))
        
        # Completion message with enhanced styling
        end_title = large_font.render("🎉 Simulation Complete! 🎉", True, (255, 220, 100))
        end_rect = end_title.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 80))
        
        # Title background box
        title_bg = pygame.Rect(end_rect.x - 30, end_rect.y - 15, end_rect.width + 60, end_rect.height + 30)
        pygame.draw.rect(screen, (80, 160, 255), title_bg, border_radius=15)
        pygame.draw.rect(screen, (255, 220, 100), title_bg, 3, border_radius=15)
        screen.blit(end_title, end_rect)
        
        # Final stats with colored boxes
        stats_y = HEIGHT // 2 + 20
        final_text = f"💰 Money: ${money}  |  📈 Growth: {growth}  |  ⭐ Reputation: {reputation}"
        final_surf = font.render(final_text, True, (255, 255, 200))
        final_rect = final_surf.get_rect(center=(WIDTH // 2, stats_y))
        
        # Stats background
        stats_bg = pygame.Rect(final_rect.x - 20, final_rect.y - 12, final_rect.width + 40, final_rect.height + 24)
        pygame.draw.rect(screen, (100, 200, 100), stats_bg, border_radius=10)
        pygame.draw.rect(screen, (255, 255, 255), stats_bg, 2, border_radius=10)
        screen.blit(final_surf, final_rect)
        
        # Restart instruction
        restart_text = small_font.render("Close the window to exit or run again to replay", True, (200, 220, 255))
        restart_rect = restart_text.get_rect(center=(WIDTH // 2, HEIGHT // 2 + 100))
        screen.blit(restart_text, restart_rect)


    pygame.display.update()

pygame.quit()
sys.exit()