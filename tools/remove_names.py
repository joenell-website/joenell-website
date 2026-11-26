"""Nov 25, 2026 owner rule: no couple names anywhere. Rewrites names in page text, alt text,
captions, titles, JSON-LD and scripts in all languages. Rules go from specific to general so
grammar (gender/number) stays right. Run from the repo root: python3 tools/remove_names.py"""
import glob, re, sys

A = '(?:&#x27;|’|\')'  # apostrophe forms
R = [
    # ---------- English: specific ----------
    (r'A Surprise Proposal at Bowen Lookout, Cypress Mountain: Jake (?:&amp;|&) Hannah', 'A Surprise Proposal at Bowen Lookout, Cypress Mountain'),
    (r'Jake (?:&amp;|&) Hannah at Bowen Lookout', 'A surprise proposal at Bowen Lookout'),
    (r'Jake and Hannah' + A + 's surprise proposal', 'A surprise proposal'),
    (r'Jake and Hannah' + A + 's proposal', 'a surprise proposal'),
    (r'Jake on one knee holding Hannah' + A + 's hand', 'On one knee, holding her hand'),
    (r'Jake on one knee proposing to Hannah', 'On one knee, proposing'),
    (r'Jake went down on one knee', 'He went down on one knee'),
    (r'where Jake proposed to Hannah', 'where I photographed a surprise proposal'),
    (r'Jake proposed to Hannah', 'he proposed'),
    (r'Hannah' + A + 's reaction', 'her reaction'),
    (r'so Hannah never saw', 'so she never saw'),
    (r'Chris brushes Lorena' + A + 's hair back', 'He brushes her hair back'),
    (r'Golden hour by the water — Chris (?:&amp;|&) Lorena', 'Golden hour by the water'),
    (r'(?:Tina|Shaun) (?:&amp;|&) (?:Shaun|Tina) — a save-the-date in the park', 'A save-the-date in the park'),
    (r'Jenn (?:&amp;|&) Erin — easy, playful, close', 'Easy, playful, close'),
    (r'Gardens and forest — Shaun and Tina', 'Gardens and forest in spring'),
    # ---------- French ----------
    (r'Jardins et forêt — Shaun et Tina', 'Jardins et forêt au printemps'),
    (r'la demande de Jake et Hannah', 'une demande surprise'),
    (r'Silhouettes de Chris et Lorena enlacés', 'Silhouettes d’un couple enlacé'),
    (r'Tout juste fiancés : Jake et Hannah enlacés et souriants', 'Tout juste fiancés : enlacés et souriants'),
    (r'Chris repousse une mèche de Lorena', 'Il lui repousse une mèche'),
    (r'Jake, un genou à terre, demande Hannah en mariage', 'Un genou à terre, il fait sa demande'),
    (r'Jake, un genou à terre, tenant la main de Hannah qui sourit', 'Un genou à terre, il lui tient la main tandis qu’elle sourit'),
    (r'Jake, un genou à terre, tient la main d’Hannah', 'Un genou à terre, il lui tient la main'),
    (r'Hannah n’a vu', 'elle n’a vu'),
    (r'Jenn et Erin enlacées', 'Couple enlacé'),
    (r'Jenn et Erin s’embrassant', 'Couple s’embrassant'),
    (r'Shaun et Tina souriants', 'Couple souriant'),
    (r'Jake et Hannah s’embrassant', 'Couple s’embrassant'),
    # ---------- Spanish ----------
    (r'Jardines y bosque — Shaun y Tina', 'Jardines y bosque en primavera'),
    (r'la propuesta de Jake y Hannah', 'una pedida sorpresa'),
    (r'Siluetas de Chris y Lorena abrazados', 'Siluetas de una pareja abrazada'),
    (r'Recién comprometidos: Jake y Hannah abrazados y sonriendo', 'Recién comprometidos: abrazados y sonriendo'),
    (r'Chris le aparta el cabello a Lorena', 'Él le aparta el cabello a ella'),
    (r'Jake de rodilla tomando la mano de Hannah', 'De rodilla, tomándole la mano'),
    (r'Jake, con una rodilla en el suelo, le pide matrimonio a Hannah', 'Con una rodilla en el suelo, él le pide matrimonio'),
    (r'Jake, con una rodilla en el suelo, toma la mano de Hannah', 'Con una rodilla en el suelo, él le toma la mano'),
    (r'Hannah no vio', 'ella no vio'),
    (r'Jenn y Erin abrazadas', 'Pareja abrazada'),
    (r'Shaun y Tina sonriendo en un banco del jardín rodeados', 'Pareja sonriendo en un banco del jardín rodeada'),
    (r'(?:Shaun y Tina|Jenn y Erin|Jake y Hannah|Chris y Lorena) sonriendo juntos', 'Pareja sonriendo'),
    # ---------- Chinese ----------
    (r'花园与森林——Shaun 和 Tina', '春日的花园与森林'),
    (r'为 Jake 和 Hannah 拍摄求婚', '拍摄过一场惊喜求婚'),
    (r'Chris 为 Lorena 拨开发丝', '他为她拨开发丝'),
    (r'Jake (在[^，,]*?)单膝跪地牵着 Hannah 的手', r'他\1单膝跪地牵着她的手'),
    (r'Jake (在[^，,]*?)单膝跪地向 Hannah 求婚', r'他\1单膝跪地向她求婚'),
    (r'Jake (在[^，,]*?)单膝跪地握着 Hannah 的手', r'他\1单膝跪地握着她的手'),
    (r'刚刚订婚：Jake 和 Hannah ', '刚刚订婚：两人'),
    (r'求婚后，Jake 和 Hannah ', '求婚后，两人'),
    (r'日落时分，Chris 和 Lorena ', '日落时分，一对情侣'),
    (r'Hannah 直到', '她直到'),
    # ---------- Punjabi ----------
    (r'ਬਾਗ ਅਤੇ ਜੰਗਲ — Shaun ਅਤੇ Tina', 'ਬਸੰਤ ਵਿੱਚ ਬਾਗ ਅਤੇ ਜੰਗਲ'),
    (r'Jake ਅਤੇ Hannah ਦਾ ਪ੍ਰਪੋਜ਼ਲ', 'ਇੱਕ ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ'),
    (r'ਗਲੇ ਮਿਲਦੇ ਅਤੇ ਮੁਸਕਰਾਉਂਦੇ Jake ਅਤੇ Hannah', 'ਗਲੇ ਮਿਲਦਾ ਅਤੇ ਮੁਸਕਰਾਉਂਦਾ ਜੋੜਾ'),
    (r'ਚੁੰਮਦੇ Jake ਅਤੇ Hannah', 'ਚੁੰਮਦਾ ਜੋੜਾ'),
    (r'Chris ਅਤੇ Lorena ਚੁੰਮਦੇ ਹੋਏ', 'ਜੋੜਾ ਚੁੰਮਦਾ ਹੋਇਆ'),
    (r'ਗਲੇ ਮਿਲਦੇ Chris ਅਤੇ Lorena ਦਾ', 'ਗਲੇ ਮਿਲਦੇ ਜੋੜੇ ਦਾ'),
    (r'ਹੱਸਦਿਆਂ Chris, Lorena ਦੇ ਵਾਲ', 'ਹੱਸਦਿਆਂ ਉਹ ਉਸਦੇ ਵਾਲ'),
    (r'ਬੈਠਾ Jake, Hannah ਦਾ ਹੱਥ ਫੜੀ', 'ਬੈਠਾ ਉਹ, ਉਸਦਾ ਹੱਥ ਫੜੀ'),
    (r'Jake ਗੋਡੇ ਭਾਰ ਬੈਠ ਕੇ Hannah ਦਾ ਹੱਥ', 'ਉਹ ਗੋਡੇ ਭਾਰ ਬੈਠ ਕੇ ਉਸਦਾ ਹੱਥ'),
    (r'ਗੋਡੇ ਟੇਕ ਕੇ Hannah ਨੂੰ ਪ੍ਰਪੋਜ਼ ਕਰਦਾ Jake', 'ਗੋਡੇ ਟੇਕ ਕੇ ਪ੍ਰਪੋਜ਼ ਕਰਦਾ ਲਾੜਾ'),
    (r'(ਮਿਲਦੀਆਂ|ਚੁੰਮਦੀਆਂ) Jenn ਅਤੇ Erin', lambda m: {'ਮਿਲਦੀਆਂ': 'ਮਿਲਦਾ', 'ਚੁੰਮਦੀਆਂ': 'ਚੁੰਮਦਾ'}[m.group(1)] + ' ਜੋੜਾ'),
    (r'(ਮੁਸਕਰਾਉਂਦੇ|ਲੈਂਦੇ|ਤੁਰਦੇ) (?:Shaun ਅਤੇ Tina|Chris ਅਤੇ Lorena|Jenn ਅਤੇ Erin|Jake ਅਤੇ Hannah)', lambda m: m.group(1)[:-1] + 'ਾ ਜੋੜਾ'),
    (r'Hannah ਨੇ', 'ਉਸ ਨੇ'),
    # ---------- generic pairs (any language), last ----------
    (r'(?:Chris|Jake|Shaun|Jenn|Tina)(?: and |\s*&amp;\s*|\s*&\s*)(?:Lorena|Hannah|Tina|Erin|Shaun)', 'COUPLE_EN'),
    (r'(?:Chris|Jake|Shaun|Jenn|Tina) et (?:Lorena|Hannah|Tina|Erin|Shaun)', 'COUPLE_FR'),
    (r'(?:Chris|Jake|Shaun|Jenn|Tina) y (?:Lorena|Hannah|Tina|Erin|Shaun)', 'COUPLE_ES'),
    (r'(?:Chris|Jake|Shaun|Jenn|Tina) 和 (?:Lorena|Hannah|Tina|Erin|Shaun)', 'COUPLE_ZH'),
    (r'(?:Chris|Jake|Shaun|Jenn|Tina) ਅਤੇ (?:Lorena|Hannah|Tina|Erin|Shaun)', 'ਜੋੜਾ'),
]
START = r'(^|["\'>]\s*|: |— |— |\(|;\s*)'


def generic(s):
    def cap(word_start, word_mid):
        def f(m):
            pre = m.group(1)
            return pre + (word_start if (pre.strip() == '' or pre.strip()[-1:] in '"\'>(:;——') else word_mid)
        return f
    s = re.sub(START + 'COUPLE_EN', cap('Couple', 'the couple'), s)
    s = re.sub(r'COUPLE_EN', 'the couple', s)
    s = re.sub(START + 'COUPLE_FR', cap('Couple', 'le couple'), s)
    s = re.sub(r'(de|à) COUPLE_FR', lambda m: ('du couple' if m.group(1) == 'de' else 'au couple'), s)
    s = re.sub(r'COUPLE_FR', 'le couple', s)
    s = re.sub(START + 'COUPLE_ES', cap('Pareja', 'la pareja'), s)
    s = re.sub(r'COUPLE_ES', 'la pareja', s)
    s = re.sub(START + 'COUPLE_ZH', cap('一对情侣', '这对情侣'), s)
    s = re.sub(r'COUPLE_ZH ?', '这对情侣', s)
    # agreement after "Couple"/"Pareja" (singular)
    s = re.sub(r'(Couple|le couple)( [^,.;"<]{0,60}?)enlacés', r'\1\2enlacé', s)
    s = re.sub(r'(Pareja|la pareja)( [^,.;"<]{0,60}?)abrazados', r'\1\2abrazada', s)
    s = re.sub(r'(Pareja|la pareja) (besándose|sonriendo|caminando|tomados)', lambda m: m.group(1) + ' ' + ('tomada' if m.group(2) == 'tomados' else m.group(2)), s)
    s = s.replace('la pareja tomada de la mano mientras intercambian', 'la pareja, de la mano, mientras intercambia')
    s = s.replace('Pareja tomada de la mano mientras intercambian', 'Pareja de la mano mientras intercambia')
    return s


def run(paths):
    changed = 0
    for f in paths:
        s = open(f, encoding='utf-8').read()
        o = s
        for a, b in R:
            s = re.sub(a, b, s)
        s = generic(s)
        if s != o:
            open(f, 'w', encoding='utf-8').write(s); changed += 1
    return changed


if __name__ == '__main__':
    files = [f for f in glob.glob('site/**/*', recursive=True) if f.endswith(('.html', '.js', '.xml', '.json', '.txt'))]
    files = [f for f in files if not f.endswith(('pageflip.js',))]
    print('changed', run(files))
