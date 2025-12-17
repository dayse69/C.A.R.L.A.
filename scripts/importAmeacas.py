#!/usr/bin/env python3
import re
import json
import sys
from pathlib import Path

def extract_creatures(txt_file):
    """Extrai criaturas do arquivo TXT de Ameaças de Arton"""
    
    with open(txt_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    creatures = []
    lines = content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Procura por ND (Nível de Desafio)
        nd_match = re.match(r'^ND\s+([\d\+A-Z]+)$', line, re.IGNORECASE)
        if nd_match:
            nd_str = nd_match.group(1)
            try:
                nd = int(nd_str) if nd_str.isdigit() else 20  # S/S+ = 20
            except:
                nd = 20
            
            # Procura pra trás para encontrar nome e tipo
            name_idx = i - 1
            while name_idx >= 0 and (not lines[name_idx].strip() or 
                  re.match(r'^(Iniciativa|Morto-vivo|Humanoides|Monstro|Construto|Elemental|Animal|Espírito)', 
                          lines[name_idx].strip(), re.IGNORECASE)):
                name_idx -= 1
            
            if name_idx < 0:
                i += 1
                continue
            
            creature_name = lines[name_idx].strip()
            
            # Encontra tipo (próxima linha não-vazia após nome)
            type_idx = name_idx + 1
            while type_idx < len(lines) and not lines[type_idx].strip():
                type_idx += 1
            
            creature_type = "Desconhecido"
            creature_size = "Médio"
            
            if type_idx < len(lines):
                type_str = lines[type_idx].strip()
                type_match = re.match(r'^(Morto-vivo|Humanoides|Monstro|Construto|Elemental|Animal|Espírito|Criatura)', 
                                     type_str, re.IGNORECASE)
                if type_match:
                    creature_type = type_match.group(1)
                    
                    # Procura tamanho (Minúsculo, Pequeno, Médio, Grande, Enorme, Colossal)
                    size_match = re.search(r'(Minúsculo|Pequeno|Médio|Grande|Enorme|Colossal)', type_str, re.IGNORECASE)
                    if size_match:
                        creature_size = size_match.group(1)
            
            creature = {
                'name': creature_name,
                'type': creature_type,
                'size': creature_size,
                'nd': nd,
                'description': '',
                'traits': {},
                'attributes': {},
                'abilities': [],
                'attacks': [],
                'source': 'T20 - Ameaças de Arton'
            }
            
            # Extrai descrição
            desc_start = type_idx + 1
            for j in range(desc_start, min(i, len(lines))):
                desc_line = lines[j].strip()
                if (desc_line and 
                    not re.match(r'^(Iniciativa|Defesa|Pontos|Deslocamento|For |Des |Con |Int |Sab |Car )', desc_line, re.IGNORECASE)):
                    creature['description'] += desc_line + ' '
            
            creature['description'] = creature['description'].strip()[:500]
            
            # Extrai estatísticas
            for j in range(type_idx, min(i + 40, len(lines))):
                stat_line = lines[j].strip()
                
                if re.search(r'Iniciativa', stat_line, re.IGNORECASE):
                    init_match = re.search(r'Iniciativa\s+([\+\-\d]+)', stat_line, re.IGNORECASE)
                    if init_match:
                        creature['traits']['initiative'] = init_match.group(1)
                
                if re.search(r'Percepção', stat_line, re.IGNORECASE):
                    perc_match = re.search(r'Percepção\s+([\+\-\d]+)', stat_line, re.IGNORECASE)
                    if perc_match:
                        creature['traits']['perception'] = perc_match.group(1)
                
                if re.match(r'^Defesa\s', stat_line, re.IGNORECASE):
                    def_match = re.search(r'Defesa\s+(\d+)', stat_line, re.IGNORECASE)
                    if def_match:
                        creature['traits']['defense'] = int(def_match.group(1))
                    
                    creature['traits']['saves'] = {}
                    fort_match = re.search(r'Fort\s+([\+\-\d]+)', stat_line, re.IGNORECASE)
                    ref_match = re.search(r'Ref\s+([\+\-\d]+)', stat_line, re.IGNORECASE)
                    will_match = re.search(r'Von\s+([\+\-\d]+)', stat_line, re.IGNORECASE)
                    
                    if fort_match:
                        creature['traits']['saves']['fort'] = int(fort_match.group(1))
                    if ref_match:
                        creature['traits']['saves']['ref'] = int(ref_match.group(1))
                    if will_match:
                        creature['traits']['saves']['will'] = int(will_match.group(1))
                
                if re.search(r'Pontos de Vida', stat_line, re.IGNORECASE):
                    hp_match = re.search(r'Pontos de Vida\s+(\d+)', stat_line, re.IGNORECASE)
                    if hp_match:
                        creature['traits']['hp'] = int(hp_match.group(1))
                
                # Atributos: For Des Con Int Sab Car
                if re.match(r'^For\s', stat_line, re.IGNORECASE):
                    str_match = re.search(r'For\s+([\d–\-]+|—|–)', stat_line)
                    dex_match = re.search(r'Des\s+([\d–\-]+|—|–)', stat_line)
                    con_match = re.search(r'Con\s+([\d–\-]+|—|–)', stat_line)
                    int_match = re.search(r'Int\s+([\d–\-]+|—|–)', stat_line)
                    wis_match = re.search(r'Sab\s+([\d–\-]+|—|–)', stat_line)
                    cha_match = re.search(r'Car\s+([\d–\-]+|—|–)', stat_line)
                    
                    if str_match:
                        creature['attributes']['strength'] = str_match.group(1)
                    if dex_match:
                        creature['attributes']['dexterity'] = dex_match.group(1)
                    if con_match:
                        creature['attributes']['constitution'] = con_match.group(1)
                    if int_match:
                        creature['attributes']['intelligence'] = int_match.group(1)
                    if wis_match:
                        creature['attributes']['wisdom'] = wis_match.group(1)
                    if cha_match:
                        creature['attributes']['charisma'] = cha_match.group(1)
            
            creatures.append(creature)
        
        i += 1
    
    return creatures

def main():
    base_dir = Path(__file__).parent.parent
    input_file = base_dir / 'data' / 'import' / 'T20 - Ameaças de Arton.txt'
    output_file = base_dir / 'data' / 'compendium' / 'compendium_ameacas.json'
    
    print(f"Lendo arquivo: {input_file}")
    
    if not input_file.exists():
        print(f"Arquivo não encontrado: {input_file}")
        sys.exit(1)
    
    creatures = extract_creatures(str(input_file))
    
    print(f"Extraídas {len(creatures)} criaturas")
    
    if creatures:
        print("\nPrimeiras 5 criaturas:")
        for i, c in enumerate(creatures[:5]):
            print(f"{i+1}. {c['name']} ({c['type']}, ND {c['nd']})")
    
    envelope = {
        'categoria': 'ameacas',
        'versao': '1.0',
        'atualizadoEm': __import__('datetime').datetime.now().isoformat(),
        'total': len(creatures),
        'entradas': creatures
    }
    # Salva em JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(envelope, f, ensure_ascii=False, indent=2)
    
    print(f"\nArquivo salvo: {output_file}")
    print(f"Total de criaturas: {len(creatures)}")

if __name__ == '__main__':
    main()
