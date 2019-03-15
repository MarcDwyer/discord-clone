import styled from 'styled-components'



export const MainDiv = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    background-color: #16171b;
`

export const Container = styled.div`
    width: 720px;
    height: 480px;
    margin: auto;
    background-color: #25252e;
    display: flex;
    flex-direction: column;
`
export const Header = styled.h2`
    color: #eee;
    margin: auto auto 10px auto;
`
export const EnterName = styled.input`
    background-color: #66666C;
    border: none;
    height: 25px;
    outline: none;
    color: #eee;
    padding: 10px 10px;
    width: 100%;
    border-radius: 5px;
`

export const Form = styled.form`
    margin: 0 auto auto auto;
    width: 55%;
`