#!/usr/bin/python3
from tkinter import *
from tkinter import messagebox
from tkinter import ttk
import json
import time
import os

'''原理：直接修改Web服务器目录下的静态文件，Web端轮询'''

'''数据'''
DB_PATH = "C:\\Users\\bkryofu\\Desktop\\scoreboard\\gamestat.json"
DATA = {
    'status': 0, 
    'startTime': 0, 
    'section': 1, 
    'team': {
        'A': {'name': '诸葛孔明', 'score': 0}, 
        'B': {'name': '王司徒', 'score': 0}
    }
}

'''回调函数'''
def disableAllWidg(a:bool):
    INUSE = NORMAL
    if(a):
        INUSE = DISABLED
    else:
        INUSE = NORMAL
    Ap1['state'] = INUSE
    Ap2['state'] = INUSE
    Ap3['state'] = INUSE
    Bp1['state'] = INUSE
    Bp2['state'] = INUSE
    Bp3['state'] = INUSE
    nameA['state'] = INUSE
    nameB['state'] = INUSE
    FreshDisplayedScores()


def gamestatus_f(*args):
    if(gamestatus.get() == "已结束"):
        disableAllWidg(1)
        DATA['status'] = 2
        DATA['startTime'] = 0
    else:
        disableAllWidg(0)
        if(gamestatus.get() == "正在比赛"):
            DATA['status'] = 1
            DATA['startTime'] = int(time.time())
        else:
            DATA['status'] = 0
            DATA['startTime'] = 0
    view['text']=str(DATA)
    FreshDisplayedScores()

def section_f():
    DATA['section'] = int(section.get())
    view['text']=str(DATA)
    FreshDisplayedScores()

def nameA_f(*args):
    #print(strvnA.get())
    DATA['team']['A']['name'] = strvnA.get()
    FreshDisplayedScores()

def nameB_f(*args):
    #print(strvnB.get())
    DATA['team']['B']['name'] = strvnB.get()
    FreshDisplayedScores()

def Ap3_f():
    DATA['team']['A']['score'] += 3
    FreshDisplayedScores()

def Ap2_f():
    DATA['team']['A']['score'] += 2
    FreshDisplayedScores()

def Ap1_f():
    DATA['team']['A']['score'] += 1
    FreshDisplayedScores()

def Bp3_f():
    DATA['team']['B']['score'] += 3
    FreshDisplayedScores()

def Bp2_f():
    DATA['team']['B']['score'] += 2
    FreshDisplayedScores()

def Bp1_f():
    DATA['team']['B']['score'] += 1
    FreshDisplayedScores()

def Am1_f():
    DATA['team']['A']['score'] -= 1
    FreshDisplayedScores()

def Bm1_f():
    DATA['team']['B']['score'] -= 1
    FreshDisplayedScores()

def FreshDisplayedScores():
    scoreA['text'] = str(DATA['team']['A']['score'])
    scoreB['text'] = str(DATA['team']['B']['score'])
    view['text']=json.dumps(DATA, ensure_ascii=False)

def save():
    open(DB_PATH, 'w', encoding='utf-8').write(json.dumps(DATA,ensure_ascii=False,indent=4))


'''窗口'''
root=Tk()
root.geometry("640x480")
root.title('计分板控制器@实验信息部')
root.resizable(False,False)
def no_closing():
	pass
#root.protocol("WM_DELETE_WINDOW",no_closing)
'''标题'''
label = Label(
    root,
    text="计分板控制器",
    font=('Sans-Serif', 32)
    )
label.grid(row=0,column=0)

'''状态'''
group = LabelFrame(
    root, 
    text="状态", 
    padx=10, 
    pady=10
)
label = Label(
    group,
    text="状态"
    )
label.grid(row=0,column=0)


gamestatus = ttk.Combobox(group,textvariable=StringVar())
gamestatus["values"]=("等待开始","正在比赛","已结束")
gamestatus.current(DATA['status'])
gamestatus.bind("<<ComboboxSelected>>",gamestatus_f)
gamestatus.grid(row=0,column=1)

label = Label(
    group,
    text="场次"
    )
label.grid(row=1,column=0)


section = Spinbox(
    group, 
    from_=1, 
    to_=99,
    command=section_f,
    state=NORMAL
)
section.grid(row=1,column=1)

group.grid(row=1,column=0)

'''TeamA'''
group = LabelFrame(
    root, 
    text="队伍A", 
    padx=10, 
    pady=10
)
label = Label(
    group,
    text="当前分数"
    )
label.grid(row=1,column=0)

scoreA = Label(
    group,
    text="0"
)
scoreA.grid(row=1,column=1)
#scoreA['text'] = 'NaN'

label = Label(
    group,
    text="队伍名称"
    )
label.grid(row=2,column=0)

strvnA = StringVar()
nameA = Entry(group,state=NORMAL, textvariable=strvnA)
nameA.insert('0', DATA['team']['A']["name"])
nameA.grid(row=2,column=1, columnspan=4)
strvnA.trace('w', nameA_f)


label = Label(
    group,
    text="得分"
    )
label.grid(row=3,column=0)

Ap1 = Button(
    group,
    text="+1",
    command=Ap1_f,
    state=NORMAL
)
Ap1.grid(row=3,column=1)

Ap2 = Button(
    group,
    text="+2",
    command=Ap2_f,
    state=NORMAL
)
Ap2.grid(row=3,column=2)

Ap3 = Button(
    group,
    text="+3",
    command=Ap3_f,
    state=NORMAL
)
Ap3.grid(row=3,column=3)

Am1 = Button(
    group,
    text="-1",
    command=Am1_f,
    bg="red",
    fg="white",
    state=NORMAL
)
Am1.grid(row=3,column=4)

group.grid(row=2,column=0)

'''TeamB'''
group = LabelFrame(
    root, 
    text="队伍B", 
    padx=10, 
    pady=10
)
label = Label(
    group,
    text="当前分数"
    )
label.grid(row=1,column=0)

scoreB = Label(
    group,
    text="0"
)
scoreB.grid(row=1,column=1)
#scoreB['text'] = 'NaN'

label = Label(
    group,
    text="队伍名称"
    )
label.grid(row=2,column=0)

strvnB = StringVar()
nameB = Entry(group,state=NORMAL, textvariable=strvnB)
nameB.insert('0', DATA['team']['B']["name"])
nameB.grid(row=2,column=1, columnspan=4)
strvnB.trace('w',nameB_f)

label = Label(
    group,
    text="得分"
    )
label.grid(row=3,column=0)

Bp1 = Button(
    group,
    text="+1",
    command=Bp1_f,
    state=NORMAL
)
Bp1.grid(row=3,column=1)

Bp2 = Button(
    group,
    text="+2",
    command=Bp2_f,
    state=NORMAL
)
Bp2.grid(row=3,column=2)

Bp3 = Button(
    group,
    text="+3",
    command=Bp3_f,
    state=NORMAL
)
Bp3.grid(row=3,column=3)

Bm1 = Button(
    group,
    text="-1",
    command=Bm1_f,
    bg="red",
    fg="white",
    state=NORMAL
)
Bm1.grid(row=3,column=4)

group.grid(row=2,column=1)

group = LabelFrame(
    root, 
    text="输出", 
    padx=20, 
    pady=10
)

view = Label(group, width=55,height=8, wraplength=400)
view.pack()

group.grid(column=0, row=4, columnspan=7)

Button(
    root,
    text="提交",
    command=save
).grid(column=2,row=4, columnspan=7)
root.mainloop()

