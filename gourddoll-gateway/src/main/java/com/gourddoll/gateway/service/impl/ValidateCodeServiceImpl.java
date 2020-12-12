package com.gourddoll.gateway.service.impl;

import com.google.code.kaptcha.Producer;
import com.gourddoll.common.core.constant.Constants;
import com.gourddoll.common.core.exception.CaptchaException;
import com.gourddoll.common.core.utils.IdUtils;
import com.gourddoll.common.core.utils.StringUtils;
import com.gourddoll.common.core.utils.sign.Base64;
import com.gourddoll.common.core.web.domain.AjaxResult;
import com.gourddoll.common.redis.service.RedisService;
import com.gourddoll.gateway.service.ValidateCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.FastByteArrayOutputStream;

import javax.annotation.Resource;
import javax.imageio.ImageIO;
import javax.naming.ldap.HasControls;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 验证码实现处理
 *
 * @author gourddoll
 */
@Service
public class ValidateCodeServiceImpl implements ValidateCodeService
{
    @Resource(name = "captchaProducer")
    private Producer captchaProducer;

    @Resource(name = "captchaProducerMath")
    private Producer captchaProducerMath;

    @Autowired
    private RedisService redisService;

    // 验证码类型
    private String captchaType = "math";

    /**
     * 生成验证码
     */
    @Override
    public AjaxResult createCapcha() throws IOException, CaptchaException
    {
        // 保存验证码信息
        String uuid = IdUtils.simpleUUID();
        String verifyKey = Constants.CAPTCHA_CODE_KEY + uuid;

        String capStr = null, code = null;
        BufferedImage image = null;

        // 生成验证码
        if ("math".equals(captchaType))
        {
            String capText = captchaProducerMath.createText();
            capStr = capText.substring(0, capText.lastIndexOf("@"));
            code = capText.substring(capText.lastIndexOf("@") + 1);
            image = captchaProducerMath.createImage(capStr);
        }
        else if ("char".equals(captchaType))
        {
            capStr = code = captchaProducer.createText();
            image = captchaProducer.createImage(capStr);
        }

        redisService.setCacheObject(verifyKey, code, Constants.CAPTCHA_EXPIRATION, TimeUnit.MINUTES);
        // 转换流信息写出
        FastByteArrayOutputStream os = new FastByteArrayOutputStream();
        try
        {
            ImageIO.write(image, "jpg", os);
        }
        catch (IOException e)
        {
            return AjaxResult.error(e.getMessage());
        }

        Map<String,Object> data = new HashMap<>();
        data.put("uuid", uuid);
        data.put("img", Base64.encode(os.toByteArray()));
        return AjaxResult.success(data);
    }

    /**
     * 校验验证码，用户传入
     */
    @Override
    public void checkCapcha(String code, String uuid) throws CaptchaException
    {
        if (StringUtils.isEmpty(code))
        {
            throw new CaptchaException("验证码不能为空");
        }
        if (StringUtils.isEmpty(uuid))
        {
            throw new CaptchaException("验证码已失效");
        }
        String verifyKey = Constants.CAPTCHA_CODE_KEY + uuid; //前缀 + 用户key
        String captcha = redisService.getCacheObject(verifyKey); //服务器value
        redisService.deleteObject(verifyKey); //删除请求验证码，下次需重新输入

        // 与服务器value校验
        if (!code.equalsIgnoreCase(captcha))
        {
            throw new CaptchaException("验证码错误");
        }
    }
}
