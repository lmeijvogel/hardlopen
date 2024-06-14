import styled, { css } from "styled-components";

const SharedButtonAndLinkStyle = css`
    text-decoration: none;
    border: 1px solid #333;

    padding: 6px;
    border-radius: 3px;

    cursor: pointer;

    font-weight: normal;

    &:hover {
        background-color: #eee;
    }
`;

export const Link = styled.a`
    ${SharedButtonAndLinkStyle}
`;

export const Button = styled.button`
    ${SharedButtonAndLinkStyle}
`;


