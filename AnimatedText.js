/**
 * Класс, реализующий анимацию текстового перехода через случайные символы.
 */
class SymbolAnimator {
    /**
     * Создает экземпляр SymbolAnimator.
     * @param element {HTMLElement} - HTML-элемент для анимации.
     */
    constructor(element) {
        this.frame = 0;
        this.queue = [];
        this.chars = "!<>-_\\/[]{}░▒▓—åß∂ƒ©˙∆˚æ≈ç√∫=+*^?#λ@$%&()~`|:,.";
        this.el = element;
        this.update = this.update.bind(this);
    }
    setText(text) {
        return new Promise((resolve) => {
            this.resolve = resolve;
            const currentText = this.el.innerText;
            const maxLength = Math.max(currentText.length, text.length);
            this.queue = [];
            for (let i = 0; i < maxLength; i++) {
                const fromChar = currentText[i] || "";
                const toChar = text[i] || "";
                const startFrame = Math.floor(40 * Math.random());
                const endFrame = startFrame + Math.floor(40 * Math.random());
                this.queue.push({ from: fromChar, to: toChar, start: startFrame, end: endFrame });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
        });
    }
    setPhrases(list, symbolDel = 200) {
        let index = 0;
        const changeText = () => {
            const currentPhrase = list[index];
            const charCount = currentPhrase.replace(/<[^>]*>/g, "").length;
            const delay = charCount * symbolDel;
            this.setText(currentPhrase).then(() => {
                setTimeout(changeText, delay);
            });
            index = (index + 1) % list.length;
        };
        changeText();
    }
    /**
     * Обновляет кадр анимации.
     */
    update() {
        let output = "";
        let count = 0;
        for (let i = 0, len = this.queue.length; i < len; i++) {
            const item = this.queue[i];
            const fromChar = item.from;
            const toChar = item.to;
            const startFrame = item.start;
            const endFrame = item.end;
            let currentChar = item.char;
            const useRandomChar = !currentChar || Math.random() < 0.28;
            if (this.frame >= endFrame) {
                count++;
                output += toChar;
            }
            else if (this.frame >= startFrame) {
                if (useRandomChar) {
                    currentChar = this.randomChar();
                    this.queue[i].char = currentChar;
                }
                output += `<span class="dud">${currentChar}</span>`;
            }
            else {
                output += fromChar;
            }
        }
        this.el.innerHTML = output;
        if (count === this.queue.length) {
            this.resolve();
        }
        else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    /**
     * Возвращает случайный символ из доступных символов.
     * @returns {string} Случайно выбранный символ.
     */
    randomChar() {
        const allChars = this.chars;
        return allChars[Math.floor(Math.random() * allChars.length)];
    }
}
/**
 * Класс, представляющий текстовый аниматор.
 */
class TextAnimator {
    /**
     * Создает экземпляр TextAnimator.
     * @param element {HTMLElement} - HTML-элемент для анимации.
     * @param animation {AnimationType} - Тип анимации.
     */
    constructor(element, animation = "symbol") {
        this.animator = this.createAnimator(element, animation);
    }
    /**
     * Создает соответствующий аниматор в зависимости от типа анимации.
     * @param element {HTMLElement} - HTML-элемент для анимации.
     * @param animation {AnimationType} - Тип анимации.
     * @returns {Animator} Созданный экземпляр аниматора.
     */
    createAnimator(element, animation) {
        switch (animation) {
            case "symbol":
                return new SymbolAnimator(element);
            default:
                throw new Error("Unsupported animation type");
        }
    }
    setText(text) {
        return this.animator.setText(text);
    }
    setPhrases(list, delay = 200) {
        return this.animator.setPhrases(list, delay);
    }
}
//# sourceMappingURL=AnimatedText.js.map