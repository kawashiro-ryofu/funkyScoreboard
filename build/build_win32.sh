#!/bin/sh
# 在win32平台下请使用git自带的shell执行

cd ..

# 指定package.json文件路径
package_file="package.json"

# 使用grep命令提取version字段的行，并使用sed命令提取版本号
version=$(grep -o '"version": *"[^"]*"' "$package_file" | sed 's/"version": "\(.*\)"/\1/')

# 检查_dist目录是否存在
if [ ! -d "_dist" ]; then
    # 如果目录不存在则创建
    mkdir _dist
fi

# 生成可执行文件
electron-packager . funkyScoreboard\
	--platform=win32\
	--arch=ia32\
	--win32metadata.FileDescription="\"Funky Scoreboard $version\"" \
	--win32metadata.CompanyName="kawashiro-ryofu@实验信息部"\
	--win32metadata.ProductName="Funky Scoreboard"\
	--ignore=.git\
	--ignore=_dist\
	--out=_dist\
	--icon=static/favicon.ico\
	--download.mirrorOptions.mirror=https:\/\/npm.taobao.org\/mirrors\/electron\/\

cd build

./rcedit-x86.exe ../_dist/funkyScoreboard-win32-ia32/funkyScoreboard.exe --set-file-version "$version" \
  --set-product-version "$version" \
  --set-icon "../static/favicon.ico" \
  --set-file-version "$version" \
  --set-version-string LegalCopyright "(C) 2023 kawashiro-ryofu, Comply with the MPL-2.0 license."\
  --set-version-string ProductVersion "$version"\
  --set-version-string CompanyName "kawashiro-ryofu@实验信息部"\
  --set-version-string FileDescription "Funky Scoreboard v$version"