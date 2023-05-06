import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import DownArrow from '../../assets/icons/arrow-down.svg';
// import ChevronDown from '../../assets/icons/chevron-down.svg';
import Loader from '../../components/Loader';
import css from './PillButton.module.scss';

export enum PillIcon {
    UP = 'UP',
    DOWN = 'DOWN',
    ARROW_DOWN = 'ARROW_DOWN',
}

export enum PillButtonFace {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
    TERTIARY = 'TERTIARY',
    PURPLE = 'PURPLE',
    WARNING = 'WARNING',
    STEEL = 'STEEL',
}

export enum PillIconPosition {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
}

export interface PillButtonProps {
    children?: ReactNode | ReactNode[]
    isFullWidth?: boolean
    isLoading?: boolean
    face?: PillButtonFace
    href?: string
    target?: '_blank' | '_parent' | '_self'
    iconPosition?: PillIconPosition
    disabled?: boolean
    inactive?: boolean
    className?: string
    onClick?: () => void
    icon?: PillIcon
}

const PillButton: FC<PillButtonProps> = ({
    icon,
    isLoading,
    children,
    face,
    className,
    isFullWidth,
    iconPosition = PillIconPosition.RIGHT,
    href,
    target = '_self',
    inactive,
    disabled,
    ...rest
}) => {
    const renderIcon = () => {
        switch (icon) {
        case PillIcon.DOWN:
            return ''
            // return <ChevronDown />
        case PillIcon.ARROW_DOWN:
            return <DownArrow />
        default:
            return null
        }
    }

    const getFaceStyle = () => {
        switch (face) {
        case PillButtonFace.SECONDARY:
            return css.buttonSecondary
        case PillButtonFace.PURPLE:
            return css.buttonPurple
        case PillButtonFace.WARNING:
            return css.buttonWarning
        case PillButtonFace.STEEL:
            return css.buttonSteel
        case PillButtonFace.TERTIARY:
            return css.buttonTertiary
        default:
            return css.button
        }
    }

    const renderContent = () => {
        const classes = classNames({
            [getFaceStyle()]: true,
            [`${css.inactive}`]: isLoading || inactive,
            [`${className}`]: !!className,
            [`${css.fullWidth}`]: isFullWidth,
            [`${css.iconLeft}`]: iconPosition === PillIconPosition.RIGHT,
            [`${css.iconRight}`]: iconPosition === PillIconPosition.LEFT,
        })

        return (
            <button {...rest} disabled={disabled} className={classes}>
                {isLoading
                    ? (
                        <Loader size="24px" />
                    )
                    : (
                        <>
                            {iconPosition === PillIconPosition.LEFT && renderIcon()}
                            {children}
                            {iconPosition === PillIconPosition.RIGHT &&
                            renderIcon()}
                        </>
                    )}
            </button>
        )
    }

    return href && !disabled
        ? (
            <a
                className={`${css.link}${isFullWidth ? css.fullWidth : ''}`}
                rel="noreferrer"
                target={target}
                href={href}
            >
                {renderContent()}
            </a>
        )
        : (
            renderContent()
        )
}

export default PillButton
