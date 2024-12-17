from datetime import datetime
import random
import time

class User:
    def __init__(self):
        self.last_ship = 0

users_cooldowns = {}
rp_actions = {
    "обнять": ["нежно обнял(а)", "крепко обнял(а)", "заключил(а) в объятия"],
    "поцеловать": ["нежно поцеловал(а)", "страстно поцеловал(а)", "подарил(а) поцелуй"],
    "ударить": ["сильно ударил(а)", "дал(а) подзатыльник", "стукнул(а)"],
    "погладить": ["нежно погладил(а)", "ласково погладил(а)", "погладил(а) по голове"],
    "покормить": ["угостил(а) вкусняшкой", "накормил(а) до отвала", "поделился(ась) едой"],
    "укусить": ["легонько укусил(а)", "сделал(а) кусь", "игриво укусил(а)"],
    "пожать руку": ["пожал(а) руку", "крепко пожал(а) руку", "торжественно пожал(а) руку"],
    "похвалить": ["похвалил(а)", "отметил(а) успехи", "выразил(а) восхищение"],
    "наказать": ["строго наказал(а)", "преподал(а) урок", "показал(а) кто главный"],
    "прижать": ["нежно прижал(а) к себе", "крепко прижал(а)", "уютно прижал(а)"]
}

ship_phrases = [
    "Любовь витает в воздухе! 💕",
    "Идеальная пара! 💑",
    "Судьба свела их вместе! ❤️",
    "Настоящая любовь! 💘",
    "Созданы друг для друга! 💖"
]

members = ["User1", "User2", "User3", "User4", "User5"] # Замените на реальный список участников

def process_command(text, user_id):
    if not text.startswith("?"): 
        return

    cmd = text[1:].split()
    if not cmd:
        return show_help()

    command = cmd[0].lower()

    if command == "help":
        return show_help()

    elif command == "шип":
        return ship_command(user_id)

    elif command in rp_actions:
        if len(cmd) < 2:
            return "[-] Укажите пользователя!"
        target = cmd[1]
        return rp_command(command, user_id, target)

    return f"[-] Команда ?{command} не найдена. Введите ?help для списка команд."

def show_help():
    help_text = [
        "[!] Доступные команды:",
        "",
        "[+] ?шип - Шипперить двух случайных участников (раз в час)",
        "[+] РП команды (Пример: ?обнять @user):"
    ]

    for cmd in rp_actions.keys():
        help_text.append(f"[+] ?{cmd}")

    return "\n".join(help_text)

def ship_command(user_id):
    if user_id not in users_cooldowns:
        users_cooldowns[user_id] = User()

    user = users_cooldowns[user_id]
    current_time = time.time()

    if current_time - user.last_ship < 3600:
        remaining = int(3600 - (current_time - user.last_ship))
        minutes = remaining // 60
        seconds = remaining % 60
        return f"[-] Подождите {minutes}м {seconds}с перед следующим шиппером!"

    user.last_ship = current_time

    user1, user2 = random.sample(members, 2)
    phrase = random.choice(ship_phrases)

    return f"[+] {user1} + {user2} = {phrase}"

def rp_command(action, user_id, target):
    variation = random.choice(rp_actions[action])
    return f"[+] {user_id} {variation} {target}"

def main():
    print("[+] Бот запущен! Введите команду (?help для помощи)")

    while True:
        try:
            text = input("\n[>] ").strip()
            if text.lower() == "exit":
                break

            if text:
                result = process_command(text, "TestUser")
                if result:
                    print(result)

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"[-] Ошибка: {e}")

    print("\n[!] Бот остановлен")

if __name__ == "__main__":
    main()
