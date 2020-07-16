---
title: React Native实现主题切换
date: 2020-02-29 15:18:33
tags:
category:
- React Native
---
## 前言
苹果的iOS13+以及Android 10+支持了新的深色模式，各家APP也陆续在适配。
那么如何在React Native中实现主题切换功能呢？
我们可以使用`Context`。

<!--more-->

![](http://images.mokeee.com/blog/20200229231944.jpg)
## Context是什么

> Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。

简单来说就是Context为跨层级的组件通信提供了一种方式。

## 具体实现

创建主题配置文件

`light.js`
```javascript
    const tintColor = '#2f95dc';
    
    export default {
        //header
        headerBg: tintColor,
        headerTitle: '#fff',
        headerIcon: '#fff',
    };
```

`dark.js`
```javascript
    const tintColor = '#000';
    
    export default {
        //header
        headerBg: tintColor,
        headerTitle: '#f5f5f5',
        headerIcon: '#f5f5f5',
    };
``` 

创建`ThemeContext`和`Provider`

通过Context把主题配置，主题名称，以及更改主题的函数changeTheme传递给子组件。
```javascript
    import React, {useState} from "react";
    import light from './light';
    import dark from './dark';
    
    const themes = {light, dark,};
    export const ThemeContext = React.createContext();
    export const ThemeContextProvider = ({children}) => {
        const [theme, changeTheme] = useState('light');
        return (<ThemeContext.Provider
            value={{theme: themes[theme], themeName: theme, changeTheme}}> {children} </ThemeContext.Provider>)
    };

使用`Provider`把根组件包起来。

    import {ThemeContextProvider} from './src/theme/ThemeContextProvider';
    
    export default function App(props) {
        return (
            <ThemeContextProvider>
                <App/>
            </ThemeContextProvider>     
        );
    
    }
 ```   

在组件中使用
```javascript
    const Theme = props => {
      const { themeName, theme, changeTheme } = useContext(ThemeContext)
    
      const change = (themeName) => {
        changeTheme(themeName)
      }
    
      return (
        <View>
          <Button onPress={() => change('dark')}>
            深色
          </Button>
          <Button onPress={() => change('light')}>
            默认
          </Button>
        </View>
      )
    }
```
以上就完成了基本的主题切换功能，

但如果我们想根据系统配色自动切换APP主题，如何实现呢？

我们可以使用 `react-native-appearance`  这个库。
```javascript
    import { Appearance, AppearanceProvider, useColorScheme } from 'react-native-appearance';
```
然后使用`AppearanceProvider` 包住根组件
```javascript
    import {ThemeContextProvider} from './src/theme/ThemeContextProvider';
    import { AppearanceProvider } from 'react-native-appearance';
    
    export default () => (
        <AppearanceProvider>
            <ThemeContextProvider>
                <App />
            </ThemeContextProvider>
        </AppearanceProvider>
    );
```
使用`Appearance.getColorScheme()`来获取当前的配色方案
```javascript
    let colorScheme = Appearance.getColorScheme();
```
如果你正在使用Hooks，可以通过 `useColorScheme` 来获取当前的配色方案。
```javascript
    import React, { useState } from "react";
    import light from './light';
    import dark from './dark;
    import { useColorScheme } from 'react-native-appearance';
    
    const themes = {
        light,
        dark,
    };
    
    export const ThemeContext = React.createContext();
    
    export const ThemeContextProvider = ({ children }) => {
        const [theme, changeTheme] = useState(useColorScheme() === 'dark' ? 'dark' : 'light');
        return (
            <ThemeContext.Provider
                value={{ theme: themes[theme], themeName: theme, changeTheme }}>
                {children}
            </ThemeContext.Provider>
        )
    };
```
如果需要实现当系统配色改变时APP主题也随之更改可以使用 `Appearance.addChangeListener` 来监听系统改变
```javascript
    let subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // do something with color scheme
    });
    
    // when you're done
    subscription.remove();

 ```
