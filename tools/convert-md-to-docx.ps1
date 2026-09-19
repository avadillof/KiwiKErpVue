#!/usr/bin/env powershell
param(
    [string]$MdPath  = "C:\Proyectos\KiwiKErpVue\docs\manual-usuario\KiwiKERP_Manual_Usuario_v3_0.md",
    [string]$OutPath = "C:\Proyectos\KiwiKErpVue\docs\manual-usuario\KiwiKERP_Manual_Usuario_v3_0.docx"
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$xmlEscape = {
    param([string]$s)
    if ($null -eq $s) { return "" }
    $s = $s.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
    $s = $s.Replace('"', "&quot;")
    return $s
}

function Convert-Inline {
    param([string]$text)
    if ([string]::IsNullOrEmpty($text)) { return "" }
    $sb = New-Object System.Text.StringBuilder
    $i = 0
    while ($i -lt $text.Length) {
        $c = $text[$i]
        if ($c -eq '`') {
            $end = $text.IndexOf('`', $i + 1)
            if ($end -gt $i) {
                $code = $text.Substring($i + 1, $end - $i - 1)
                [void]$sb.Append("<w:r><w:rPr><w:rFonts w:ascii=`"Consolas`" w:hAnsi=`"Consolas`" w:cs=`"Consolas`"/></w:rPr><w:t xml:space=`"preserve`">" + (& $xmlEscape $code) + "</w:t></w:r>")
                $i = $end + 1
                continue
            }
        }
        if ($text.IndexOf("**", $i) -eq $i) {
            $end = $text.IndexOf("**", $i + 2)
            if ($end -gt $i) {
                $inner = $text.Substring($i + 2, $end - $i - 2)
                [void]$sb.Append("<w:r><w:rPr><w:b/></w:rPr><w:t xml:space=`"preserve`">" + (& $xmlEscape $inner) + "</w:t></w:r>")
                $i = $end + 2
                continue
            }
        }
        if ($c -eq '*' -and ($i -eq 0 -or $text[$i - 1] -ne '*')) {
            $end = $text.IndexOf("*", $i + 1)
            if ($end -gt $i -and $text[$i + 1] -ne '*') {
                $inner = $text.Substring($i + 1, $end - $i - 1)
                if ($inner -match '^\*') { $inner = $inner.TrimStart('*') }
                [void]$sb.Append("<w:r><w:rPr><w:i/></w:rPr><w:t xml:space=`"preserve`">" + (& $xmlEscape $inner) + "</w:t></w:r>")
                $i = $end + 1
                continue
            }
        }
        $chunk = ""
        while ($i -lt $text.Length) {
            $cc = $text[$i]
            if ($cc -eq '`' -or $text.IndexOf("**", $i) -eq $i) { break }
            $chunk += $cc
            $i++
        }
        if ($chunk) { [void]$sb.Append("<w:r><w:t xml:space=`"preserve`">" + (& $xmlEscape $chunk) + "</w:t></w:r>") }
    }
    return $sb.ToString()
}

$imgCounter = 0
$relCounter = 0
$mediaList = @{}
$rels = New-Object System.Collections.ArrayList
$body = New-Object System.Collections.ArrayList
$numSeq = 2
$numDefs = New-Object System.Collections.ArrayList

function New-Rel([string]$TypeFrag, [string]$Target) {
    $script:relCounter++
    $id = "rId$script:relCounter"
    [void]$script:rels.Add([pscustomobject]@{ Id = $id; Type = $TypeFrag; Target = $Target })
    return $id
}

function Add-Image([string]$relPath, [string]$alt) {
    $script:imgCounter++
    $srcDir = Split-Path -Parent $MdPath
    $full = Join-Path $srcDir $relPath
    if (-not (Test-Path -LiteralPath $full)) { throw "Imagen no encontrada: $relPath" }
    $ext = [System.IO.Path]::GetExtension($full).ToLower().TrimStart('.')
    if ($ext -eq 'jpg') { $ext = 'jpeg' }
    $name = "image$script:imgCounter.$ext"
    $bytes = [System.IO.File]::ReadAllBytes($full)
    $script:mediaList[$name] = $bytes
    $rid = New-Rel "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" "media/$name"

    try {
        $stream = [System.IO.MemoryStream]::new($bytes)
        $img = [System.Drawing.Image]::FromStream($stream)
        $pxW = $img.Width; $pxH = $img.Height
        $img.Dispose(); $stream.Dispose()
    } catch {
        $pxW = 960; $pxH = 540
    }
    $emuW = [int]($pxW * 9525)
    $emuH = [int]($pxH * 9525)
    $maxEmuW = 5400000
    $maxEmuH = 5200000
    if ($emuW -gt $maxEmuW) { $emuH = [int]($emuH * ($maxEmuW / $emuW)); $emuW = $maxEmuW }
    if ($emuH -gt $maxEmuH) { $emuW = [int]($emuW * ($maxEmuH / $emuH)); $emuH = $maxEmuH }

    $xmlalt = & $xmlEscape $alt
    return @"
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="120"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="$emuW" cy="$emuH"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="$script:imgCounter" name="figura$script:imgCounter" descr="$xmlalt"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="$script:imgCounter" name="figura$script:imgCounter"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="$rid"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="$emuW" cy="$emuH"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Figura"/><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">Figura $script:imgCounter. $xmlalt</w:t></w:r></w:p>
"@
}

function Add-Para([string]$text, [string]$style = "", [string]$extraPPr = "") {
    $runs = Convert-Inline $text
    $pfx = if ($style) { "<w:pStyle w:val=`"$style`"/>" } else { "" }
    $ppr = "<w:pPr>$pfx$extraPPr</w:pPr>"
    return "<w:p>$ppr$runs</w:p>"
}

function Add-ListPara([string]$text, [int]$numId, [int]$ilvl = 0) {
    $runs = Convert-Inline $text
    $ind = 360 + ($ilvl * 360)
    return "<w:p><w:pPr><w:numPr><w:ilvl w:val=`"$ilvl`"/><w:numId w:val=`"$numId`"/></w:numPr><w:ind w:left=`"$ind`"/></w:pPr>$runs</w:p>"
}

function Add-CodeLine([string]$text) {
    $e = & $xmlEscape $text
    return "<w:p><w:pPr><w:pStyle w:val=`"Codigo`"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=`"Consolas`" w:hAnsi=`"Consolas`" w:cs=`"Consolas`"/></w:rPr><w:t xml:space=`"preserve`">$e</w:t></w:r></w:p>"
}

function Add-Table([string[][]]$rows) {
    if ($rows.Count -eq 0) { return "" }
    $cols = 0
    foreach ($r in $rows) { if ($r.Count -gt $cols) { $cols = $r.Count } }
    $xml = "<w:tbl><w:tblPr><w:tblStyle w:val=`"Tabla`"/><w:tblW w:w=`"0`" w:type=`"auto`"/><w:tblLook w:val=`"04A0`" w:firstRow=`"1`" w:lastRow=`"0`" w:firstColumn=`"0`" w:lastColumn=`"0`" w:noHBand=`"0`" w:noVBand=`"1`"/></w:tblPr>"
    for ($c = 0; $c -lt $cols; $c++) { $xml += "<w:gridCol/>" }
    for ($ri = 0; $ri -lt $rows.Count; $ri++) {
        $xml += "<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>"
        for ($ci = 0; $ci -lt $cols; $ci++) {
            $cell = if ($ci -lt $rows[$ri].Count) { $rows[$ri][$ci] } else { "" }
            $runs = Convert-Inline $cell
            if ($ri -eq 0) {
                $ppr = "<w:pPr><w:pStyle w:val=`"CeldaEncabezado`"/></w:pPr>"
                $tcPr = "<w:tcPr><w:tcW w:w=`"0`" w:type=`"auto`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"1F4E79`"/></w:tcPr>"
            } else {
                $ppr = "<w:pPr><w:pStyle w:val=`"Celda`"/></w:pPr>"
                $tcPr = "<w:tcPr><w:tcW w:w=`"0`" w:type=`"auto`"/></w:tcPr>"
            }
            $xml += "<w:tc>$tcPr<w:p>$ppr$runs</w:p></w:tc>"
        }
        $xml += "</w:tr>"
    }
    $xml += "</w:tbl>"
    return $xml
}

function Add-Caption([string]$text) {
    return "<w:p><w:pPr><w:pStyle w:val=`"Reticencia`"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val=`"808080`"/></w:rPr><w:t xml:space=`"preserve`">$(& $xmlEscape $text)</w:t></w:r></w:p>"
}

function Add-PageBreak {
    return "<w:p><w:pPr><w:spacing w:after=`"0`"/></w:pPr><w:r><w:br w:type=`"page`"/></w:r></w:p>"
}

function Split-TableRow([string]$line) {
    $line = $line.Trim()
    if ($line.StartsWith("|")) { $line = $line.Substring(1) }
    if ($line.EndsWith("|")) { $line = $line.Substring(0, $line.Length - 1) }
    $cells = $line -split "\|"
    $out = New-Object System.Collections.ArrayList
    foreach ($c in $cells) { [void]$out.Add($c.Trim()) }
    return ,$out.ToArray()
}

$lines = Get-Content -LiteralPath $MdPath -Encoding UTF8

$isCodeFence = $false
$codeAcc = New-Object System.Collections.ArrayList
$block = New-Object System.Collections.ArrayList
$titleDone = $false
$tocInserted = $false

function Flush-Block {
    if ($script:block.Count -eq 0) { return }
    $first = $script:block[0]
    if ($first -match '^\s*\d+\.\s') {
        $script:numSeq++
        $newNumId = $script:numSeq
        [void]$script:numDefs.Add("<w:num w:numId=`"$newNumId`"><w:abstractNumId w:val=`"0`"/><w:lvlOverride w:ilvl=`"0`"><w:startOverride w:val=`"1`"/></w:lvlOverride></w:num>")
        foreach ($ln in $script:block) {
            $txt = $ln -replace '^\s*\d+\.\s*', ''
            [void]$script:body.Add((Add-ListPara $txt $newNumId))
        }
    }
    elseif ($first -match '^-\s|^\*\s') {
        foreach ($ln in $script:block) {
            $txt = $ln -replace '^[-*]\s+', ''
            [void]$script:body.Add((Add-ListPara $txt 2))
        }
    }
    elseif ($first -match '^\|') {
        $dataRows = New-Object System.Collections.ArrayList
        foreach ($ln in $script:block) {
            $cells = @(Split-TableRow $ln)
            if ($cells.Count -gt 0) {
                $isSep = $true
                foreach ($c in $cells) { if ($c -notmatch '^:?-{2,}:?$') { $isSep = $false; break } }
                if (-not $isSep) { [void]$dataRows.Add($cells) }
            }
        }
        if ($dataRows.Count -gt 0) {
            [void]$script:body.Add((Add-Table $dataRows))
            [void]$script:body.Add((Add-Para ""))
        }
    }
    elseif ($first -match '^\s*>') {
        $txts = New-Object System.Collections.ArrayList
        foreach ($ln in $script:block) {
            $t = $ln -replace '^\s*>\s?', ''
            [void]$txts.Add($t)
        }
        $joined = $txts -join " "
        if ($joined -match 'CAPTURA') {
            [void]$script:body.Add((Add-Caption $joined))
        } else {
            $runs = Convert-Inline $joined
            [void]$script:body.Add("<w:p><w:pPr><w:pStyle w:val=`"Comentario`"/></w:pPr>$runs</w:p>")
        }
    }
    else {
        for ($bi = 0; $bi -lt $script:block.Count; $bi++) {
            $ln = $script:block[$bi]
            if ($ln -match '^!\[([^\]]*)\]\(([^)]*)\)') {
                [void]$script:body.Add((Add-Image $matches[2] $matches[1]))
            }
            else {
                [void]$script:body.Add((Add-Para $ln))
            }
        }
    }
    $script:block.Clear()
}

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    if ($line -match '^```') {
        if ($isCodeFence) {
            foreach ($cl in $codeAcc) { [void]$script:body.Add((Add-CodeLine $cl)) }
            $codeAcc.Clear()
            $isCodeFence = $false
        } else {
            Flush-Block
            $isCodeFence = $true
        }
        continue
    }
    if ($isCodeFence) {
        [void]$codeAcc.Add($line)
        continue
    }

    if ($line -match '^#{1,4}\s') {
        Flush-Block
        $level = ($line -split ' ')[0].Length
        $text = ($line -replace '^#{1,4}\s+', '').Trim()
        $runs = Convert-Inline $text

        if (-not $script:titleDone -and $level -eq 1) {
            [void]$script:body.Add("<w:p><w:pPr><w:pStyle w:val=`"Portada`"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space=`"preserve`">$(& $xmlEscape $text)</w:t></w:r></w:p>")
            $script:titleDone = $true
            continue
        }

        if (-not $script:tocInserted -and $level -eq 1) {
            $script:tocInserted = $true
            [void]$script:body.Add((Add-PageBreak))
            $tocRuns = Convert-Inline "Indice de contenidos"
            [void]$script:body.Add("<w:p><w:pPr><w:pStyle w:val=`"TituloIndice`"/></w:pPr>$tocRuns</w:p>")
            [void]$script:body.Add("<w:p><w:pPr><w:pStyle w:val=`"Toc`"/></w:pPr><w:r><w:fldChar w:fldCharType=`"begin`" w:dirty=`"true`"/></w:r><w:r><w:instrText xml:space=`"preserve`">TOC \o &quot;1-2&quot; \z \u</w:instrText></w:r><w:r><w:fldChar w:fldCharType=`"separate`"/></w:r><w:r><w:t xml:space=`"preserve`">(Actualice el indice con F9)</w:t></w:r><w:r><w:fldChar w:fldCharType=`"end`"/></w:r></w:p>")
            [void]$script:body.Add("<w:p><w:pPr><w:spacing w:after=`"0`"/></w:pPr></w:p>")
        }

        switch ($level) {
            1 { $h = "<w:pPr><w:pStyle w:val=`"Titulo1`"/><w:pageBreakBefore/></w:pPr>" }
            2 { $h = "<w:pPr><w:pStyle w:val=`"Titulo2`"/></w:pPr>" }
            3 { $h = "<w:pPr><w:pStyle w:val=`"Titulo3`"/></w:pPr>" }
            4 { $h = "<w:pPr><w:pStyle w:val=`"Titulo4`"/></w:pPr>" }
        }
        [void]$script:body.Add("<w:p>$h$runs</w:p>")
        continue
    }

    if ($line -match '^\s*---\s*$|^\s*\*\*\*\s*$') {
        Flush-Block
        continue
    }
    if ($line.Trim() -eq "") {
        Flush-Block
        continue
    }
    if ($line -match '^\s*([-*])\s') {
        if ($script:block.Count -gt 0 -and $script:block[0] -notmatch '^[-*]\s') { Flush-Block }
        [void]$script:block.Add($line)
        continue
    }
    if ($line -match '^\s*\d+\.\s') {
        if ($script:block.Count -gt 0 -and $script:block[0] -notmatch '^\d+\.\s') { Flush-Block }
        [void]$script:block.Add($line)
        continue
    }
    if ($line -match '^\|') {
        if ($script:block.Count -gt 0 -and $script:block[0] -notmatch '^\|') { Flush-Block }
        [void]$script:block.Add($line)
        continue
    }
    if ($line -match '^\s*>') {
        if ($script:block.Count -gt 0 -and $script:block[0] -notmatch '^\s*>') { Flush-Block }
        [void]$script:block.Add($line)
        continue
    }
    [void]$script:block.Add($line)
}
Flush-Block
if ($codeAcc.Count -gt 0) {
    foreach ($cl in $codeAcc) { [void]$script:body.Add((Add-CodeLine $cl)) }
    $codeAcc.Clear()
}

$xmlBody = $body -join "`n"

$rStyles = New-Rel "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" "styles.xml"
$rNumbering = New-Rel "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" "numbering.xml"
$rSettings = New-Rel "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" "settings.xml"

$relsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
$(($rels | ForEach-Object { "  <Relationship Id=`"$($_.Id)`" Type=`"$($_.Type)`" Target=`"$($_.Target)`"/>" }) -join "`n")
</Relationships>
"@

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
<w:body>
$xmlBody
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>
</w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Portada"><w:name w:val="Portada"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="4320" w:after="240"/></w:pPr><w:rPr><w:sz w:val="44"/><w:color w:val="1F4E79"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="TituloIndice"><w:name w:val="TituloIndice"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1F4E79"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Toc"><w:name w:val="Toc"/><w:basedOn w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Titulo1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/><w:spacing w:before="360" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="34"/><w:color w:val="1F4E79"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Titulo2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="2E74B5"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Titulo3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="2"/><w:spacing w:before="180" w:after="60"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1F4E79"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Titulo4"><w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="3"/><w:spacing w:before="160" w:after="60"/></w:pPr><w:rPr><w:b/><w:i/><w:sz w:val="22"/><w:color w:val="404040"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Comentario"><w:name w:val="Comentario"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360" w:right="360"/><w:shd w:val="clear" w:color="auto" w:fill="FFF2CC"/><w:pBdr><w:left w:val="single" w:sz="18" w:space="4" w:color="BF9000"/></w:pBdr></w:pPr><w:rPr><w:i/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Reticencia"><w:name w:val="Reticencia"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="240"/><w:shd w:val="clear" w:color="auto" w:fill="EDEDED"/><w:ind w:left="360" w:right="360"/></w:pPr><w:rPr><w:i/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Figura"><w:name w:val="Figura"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="240"/></w:pPr><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="595959"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Codigo"><w:name w:val="Codigo"/><w:basedOn w:val="Normal"/><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/><w:spacing w:before="0" w:after="0"/><w:ind w:left="360"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Celda"><w:name w:val="Celda"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="CeldaEncabezado"><w:name w:val="CeldaEncabezado"/><w:basedOn w:val="Celda"/><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Table Normal"/><w:uiPriority w:val="99"/></w:style>
<w:style w:type="table" w:styleId="Tabla"><w:name w:val="Tabla"/><w:basedOn w:val="TableNormal"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="1F4E79"/><w:left w:val="single" w:sz="4" w:space="0" w:color="1F4E79"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="1F4E79"/><w:right w:val="single" w:sz="4" w:space="0" w:color="1F4E79"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="91A7C4"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="91A7C4"/></w:tblBorders><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>
"@

$numberingXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:isLgl w:val="0"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl><w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%2."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="1080" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#9679;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:color w:val="1F4E79"/></w:rPr></w:lvl><w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#9679;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="1080" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
<w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
$(($numDefs) -join "`n")
</w:numbering>
"@

$settingsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:updateFields w:val="true"/></w:settings>
"@

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>
"@

if (Test-Path -LiteralPath $OutPath) { Remove-Item -LiteralPath $OutPath -Force }

$fs = [System.IO.File]::Open($OutPath, [System.IO.FileMode]::CreateNew)
$zip = [System.IO.Compression.ZipArchive]::new($fs, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-Entry([string]$name, [string]$content) {
    $entry = $zip.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
    $s = $entry.Open()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $s.Write($bytes, 0, $bytes.Length)
    $s.Close()
}

Add-Entry "[Content_Types].xml" $contentTypesXml
Add-Entry "_rels/.rels" (@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>
"@)
Add-Entry "word/document.xml" $documentXml
Add-Entry "word/_rels/document.xml.rels" $relsXml
Add-Entry "word/styles.xml" $stylesXml
Add-Entry "word/numbering.xml" $numberingXml
Add-Entry "word/settings.xml" $settingsXml
foreach ($k in $mediaList.Keys) {
    $entry = $zip.CreateEntry("word/media/$k", [System.IO.Compression.CompressionLevel]::Optimal)
    $s = $entry.Open()
    $s.Write($mediaList[$k], 0, $mediaList[$k].Length)
    $s.Close()
}
$zip.Dispose()
$fs.Close()

Write-Output "DOCX generado: $OutPath"
Write-Output "Tamano: $((Get-Item -LiteralPath $OutPath).Length) bytes"
Write-Output "Imagenes incrustadas: $($mediaList.Keys.Count)"
Write-Output "Listas numeradas: $($numDefs.Count)"
Write-Output "Relaciones: $($rels.Count)"